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
        .execute(mysql)
        .await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Updated,
            id,
            color: Some(data.color.set.clone()),
            color_code: Some(data.color_code.set.clone()),
            edit_by: context.user_id,
            // edit_by: 0,
        };

        Subscriptor::publish(color_payload);

        update_revision(mysql).await?;

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
        .execute(mysql)
        .await?
        .last_insert_id() as i32;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Created,
            id,
            color: Some(color.color.clone()),
            color_code: Some(color.color_code.set.clone()),
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        if color.auto_create_effect.unwrap_or(false) {
            let model_parts = sqlx::query!(
                r#"
                    SELECT
                        Model.id,
                        Part.id AS part_id,
                        Part.length AS part_length
                    FROM Model
                    INNER JOIN Part ON Model.id = Part.model_id
                    WHERE Part.type = 'LED';
                "#
            )
            .fetch_all(mysql)
            .await?
            .into_iter()
            .map(|row| {
                let length = row.part_length.unwrap_or(0);
                (row.id, row.part_id, length)
            })
            .collect_vec();

            let create_effect_futures = model_parts.iter().map(|model_part| {
                sqlx::query!(
                    r#"
                        INSERT INTO LEDEffect (name, model_id, part_id)
                        VALUES (?, ?, ?);
                    "#,
                    color.color.clone(),
                    model_part.0,
                    model_part.1
                )
                .execute(mysql)
            });

            let create_effect_results = futures::future::join_all(create_effect_futures)
                .await
                .into_iter()
                .filter_map(|result| result.ok())
                .collect_vec();

            let mut create_states_futures = Vec::new();
            create_effect_results
                .iter()
                .zip(model_parts.iter())
                .for_each(|(result, dancer_part)| {
                        for pos in 0..dancer_part.2 {
                            create_states_futures.push(
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
                                .execute(mysql),
                            )
                        }
                });

            futures::future::join_all(create_states_futures).await;

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
                        model_name: "".to_string(),
                        part_name: "".to_string(),
                        repeat: 0,
                        frames,
                    }
                })
                .collect_vec();

            let led_payload = LEDPayload {
                create_effects,
                update_effects: Vec::new(),
                delete_effects: Vec::new(),
            };

            Subscriptor::publish(led_payload);
        }

        update_revision(mysql).await?;

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

        let color = sqlx::query_as!(
            ColorData,
            r#"
                SELECT * FROM Color
                WHERE id = ?;
            "#,
            id
        )
        .fetch_one(mysql)
        .await?;

        let check = sqlx::query!(
            r#"
                SELECT * FROM ControlData
                WHERE color_id = ?;
            "#,
            id
        )
        .fetch_optional(mysql)
        .await?;

        if let Some(check) = check {
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
        .execute(mysql)
        .await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::Deleted,
            id,
            color: None,
            color_code: None,
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        update_revision(mysql).await?;

        Ok(ColorResponse {
            id,
            msg: "Color deleted.".to_string(),
            ok: true,
        })
    }
}
