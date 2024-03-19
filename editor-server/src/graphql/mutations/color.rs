//! Color mutation methods.
use crate::db::types::color::ColorData;
use crate::graphql::types::led::{LEDEffectData, LEDEffectFrame};
use crate::graphql::{
    subscriptions::color::{ColorMutationMode, ColorPayload},
    subscriptions::led::LEDPayload,
    subscriptor::Subscriptor,
    types::color::Color,
};
use crate::types::global::UserContext;
use crate::utils::revision::update_revision;

use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};
use itertools::Itertools;

// TODO: Remove this after all done
#[derive(InputObject, Default, Debug)]
pub struct StringFieldUpdateOperationsInput {
    pub set: String,
}

#[derive(InputObject, Default, Debug)]
pub struct ColorUpdateColorCodeInput {
    pub set: Vec<i32>,
}

#[derive(InputObject, Default)]
pub struct ColorUpdateInput {
    pub color: StringFieldUpdateOperationsInput,
    pub color_code: ColorUpdateColorCodeInput,
}

#[derive(InputObject, Default, Debug)]
pub struct ColorCreateColorCodeInput {
    pub set: Vec<i32>,
}

#[derive(InputObject, Default)]
pub struct ColorCreateInput {
    pub color: String,
    pub color_code: ColorCreateColorCodeInput,
    pub auto_create_effect: Option<bool>,
}

#[derive(SimpleObject, Default)]
pub struct ColorResponse {
    pub id: i32,
    pub msg: String,
    pub ok: bool,
}

#[derive(Default)]
pub struct ColorMutation;

#[Object]
impl ColorMutation {
    async fn edit_color(
        &self,
        ctx: &Context<'_>,
        id: i32,
        data: ColorUpdateInput,
    ) -> GQLResult<Color> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let mut tx = mysql.begin().await?;

        let _ = sqlx::query!(
            r#"
                UPDATE Color SET name = ?, r = ?, g = ?, b = ?
                WHERE id = ?;
            "#,
            &data.color.set,
            data.color_code.set[0],
            data.color_code.set[1],
            data.color_code.set[2],
            id
        )
        .execute(&mut *tx)
        .await?;

        update_revision(&mut *tx).await?;

        // commit the transaction
        tx.commit().await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Updated,
            id,
            color: Some(data.color.set.clone()),
            color_code: Some(data.color_code.set.clone()),
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        let color = Color {
            id,
            color: data.color.set,
            color_code: data.color_code.set,
        };

        Ok(color)
    }

    async fn add_color(&self, ctx: &Context<'_>, color: ColorCreateInput) -> GQLResult<Color> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let mut tx = mysql.begin().await?;

        let id = sqlx::query!(
            r#"
                INSERT INTO Color (name, r, g, b)
                VALUES (?, ?, ?, ?);
            "#,
            &color.color,
            color.color_code.set[0],
            color.color_code.set[1],
            color.color_code.set[2]
        )
        .execute(&mut *tx)
        .await?
        .last_insert_id() as i32;

        let led_payload = if color.auto_create_effect.unwrap_or(false) {
            let model_parts = sqlx::query!(
                r#"
                    SELECT
                        Model.id,
                        Model.name AS model_name,
                        Part.id AS part_id,
                        Part.name AS part_name,
                        Part.length AS part_length
                    FROM Model
                    INNER JOIN Part ON Model.id = Part.model_id
                    WHERE Part.type = 'LED';
                "#
            )
            .fetch_all(&mut *tx)
            .await?
            .into_iter()
            .map(|row| {
                let length = row.part_length.unwrap_or(0);
                (row.id, row.part_id, length, row.model_name, row.part_name)
            })
            .collect_vec();

            let mut create_effect_results = Vec::new();
            for model_part in model_parts.iter() {
                create_effect_results.push(
                    sqlx::query!(
                        r#"
                            INSERT INTO LEDEffect (name, model_id, part_id)
                            VALUES (?, ?, ?);
                        "#,
                        color.color.clone(),
                        model_part.0,
                        model_part.1
                    )
                    .execute(&mut *tx)
                    .await?,
                );
            }

            let mut create_states_results = Vec::new();
            for (result, model_part) in create_effect_results.iter().zip(&model_parts) {
                for pos in 0..model_part.2 {
                    create_states_results.push(
                        sqlx::query!(
                            r#"
                                INSERT INTO LEDEffectState (effect_id, position, color_id, alpha)
                                VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE color_id = VALUES(color_id), alpha = VALUES(alpha);
                            "#,
                            result.last_insert_id() as i32,
                            pos,
                            id,
                            255
                        )
                        .execute(&mut *tx)
                        .await?,
                    )
                }
            }

            let create_effects = create_effect_results
                .iter()
                .zip(model_parts)
                .map(|(result, model_part)| {
                    let effect_id = result.last_insert_id() as i32;
                    let frames = (0..model_part.2)
                        .map(|pos| LEDEffectFrame {
                            leds: (0..model_part.2).map(|_| [id, 255]).collect_vec(),
                            fade: false,
                            start: pos,
                        })
                        .collect_vec();

                    LEDEffectData {
                        id: effect_id,
                        name: color.color.clone(),
                        model_name: model_part.3,
                        part_name: model_part.4,
                        repeat: 0,
                        frames,
                    }
                })
                .collect_vec();

            Some(LEDPayload {
                create_effects,
                update_effects: Vec::new(),
                delete_effects: Vec::new(),
            })
        } else {
            None
        };

        update_revision(&mut *tx).await?;

        // commit the transaction
        tx.commit().await?;

        if let Some(led_payload) = led_payload {
            Subscriptor::publish(led_payload);
        }

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Created,
            id,
            color: Some(color.color.clone()),
            color_code: Some(color.color_code.set.clone()),
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        let color = Color {
            id,
            color: color.color,
            color_code: color.color_code.set,
        };

        Ok(color)
    }

    #[allow(unused)]
    async fn delete_color(&self, ctx: &Context<'_>, id: i32) -> GQLResult<ColorResponse> {
        let context = ctx.data::<UserContext>()?;
        let app_state = &context.clients;

        let mysql = app_state.mysql_pool();
        let mut tx = mysql.begin().await?;

        let color = sqlx::query_as!(
            ColorData,
            r#"
                SELECT * FROM Color
                WHERE id = ?;
            "#,
            id
        )
        .fetch_one(&mut *tx)
        .await?;

        let check_color = sqlx::query!(
            r#"
                SELECT COUNT(ControlData.frame_id) AS count
                FROM ControlData
                WHERE ControlData.color_id = ?;
            "#,
            id
        )
        .fetch_one(&mut *tx)
        .await?
        .count;

        let check_effect = sqlx::query!(
            r#"
                SELECT COUNT(ControlData.frame_id) AS count
                FROM LEDEffectState
                INNER JOIN ControlData 
                    ON ControlData.effect_id = LEDEffectState.effect_id
                WHERE LEDEffectState.color_id = ?;
            "#,
            id
        )
        .fetch_one(&mut *tx)
        .await?
        .count;

        if check_color + check_effect > 0 {
            return Ok(ColorResponse {
                id: 0,
                msg: "Color is used in control data with id.".to_string(),
                ok: false,
            });
        }

        let _ = sqlx::query!(
            r#"
                DELETE FROM Color
                WHERE id = ?;
            "#,
            id
        )
        .execute(&mut *tx)
        .await?;

        let delete_effects = sqlx::query!(
            r#"
                SELECT
                    DISTINCT LEDEffect.id,
                    Model.name AS model_name,
                    Part.name AS part_name
                FROM LEDEffectState
                INNER JOIN LEDEffect
                    ON LEDEffectState.effect_id = LEDEffect.id
                INNER JOIN Model ON LEDEffect.model_id = Model.id
                INNER JOIN Part ON LEDEffect.part_id = Part.id
                WHERE LEDEffectState.color_id = ?;
            "#,
            id
        )
        .fetch_all(&mut *tx)
        .await?;

        for effect in delete_effects.iter() {
            sqlx::query!(
                r#"
                    DELETE FROM LEDEffect
                    WHERE id = ?;
                "#,
                effect.id
            )
            .execute(&mut *tx)
            .await?;
        }

        update_revision(&mut *tx).await?;

        // commit the transaction
        tx.commit().await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Deleted,
            id,
            color: None,
            color_code: None,
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        let delete_effects = delete_effects
            .iter()
            .map(|effect| LEDEffectData {
                id: effect.id,
                name: color.name.clone(),
                model_name: effect.model_name.clone(),
                part_name: effect.part_name.clone(),
                repeat: 0,
                frames: Vec::new(),
            })
            .collect_vec();

        let led_payload = LEDPayload {
            create_effects: Vec::new(),
            update_effects: Vec::new(),
            delete_effects,
        };

        Subscriptor::publish(led_payload);

        Ok(ColorResponse {
            id,
            msg: "Color deleted.".to_string(),
            ok: true,
        })
    }
}
