use crate::graphql::types::led::{Frame, LEDEffectData, LEDEffectFrame};
use crate::graphql::{subscriptions::led::LEDPayload, subscriptor::Subscriptor};
use crate::types::global::UserContext;
use async_graphql::{
    Context, Error as GQLError, InputObject, Object, Result as GQLResult, SimpleObject,
};
use serde::{Deserialize, Serialize};

// struct defined to to fit old schema
#[derive(InputObject, Default, Debug)]
pub struct Set {
    set: Vec<Frame>,
}

#[derive(InputObject, Default, Debug)]
#[graphql(name = "LEDEffectCreateInput")]
pub struct LEDEffectCreateInput {
    pub name: String,
    pub dancer_name: String,
    pub part_name: String,
    pub repeat: i32,
    pub frames: Set,
}

#[derive(InputObject, Default, Debug)]
#[graphql(name = "EditLEDInput")]
pub struct EditLEDInput {
    pub id: i32,
    pub name: String,
    pub repeat: i32,
    pub frames: Set,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
#[graphql(name = "LEDEffectResponse")]
pub struct LEDEffectResponse {
    id: i32,
    dancer_name: String,
    part_name: String,
    effect_name: String,
    repeat: i32,
    effects: Vec<LEDEffectFrame>,
    ok: bool,
    msg: String,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
#[graphql(name = "DeleteLEDEffectResponse")]
pub struct DeleteLEDEffectResponse {
    ok: bool,
    msg: String,
}

#[derive(Default)]
pub struct LEDMutation;

#[Object]
impl LEDMutation {
    #[graphql(name = "addLEDEffect")]
    async fn add_led_effect(
        &self,
        ctx: &Context<'_>,
        input: LEDEffectCreateInput,
    ) -> GQLResult<LEDEffectResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let effect_name = input.name.clone();
        let dancer_name = input.dancer_name.clone();
        let part_name = input.part_name.clone();
        let repeat = input.repeat;
        let frames: Vec<LEDEffectFrame> = input
            .frames
            .set
            .iter()
            .map(|frame| LEDEffectFrame {
                leds: frame.leds.clone(),
                fade: frame.fade,
                start: frame.start,
            })
            .collect();

        // check part exists
        let (dancer_id, part_id) = match sqlx::query!(
            r#"
                SELECT
                    Dancer.id as "dancer_id",
                    Part.id as "part_id"
                FROM Part
                INNER JOIN Dancer ON Part.dancer_id = Dancer.id
                WHERE Part.name = ? AND Dancer.name = ?;
            "#,
            &part_name,
            &dancer_name,
        )
        .fetch_one(mysql)
        .await
        {
            Ok(row) => (row.dancer_id, row.part_id),
            Err(_) => {
                return Ok(LEDEffectResponse {
                    id: -1,
                    dancer_name,
                    part_name,
                    effect_name,
                    repeat,
                    effects: vec![],
                    ok: false,
                    msg: "No corresponding dancer-part pair.".to_string(),
                })
            }
        };

        // create array of all color ids from db
        let colors = sqlx::query!(
            r#"
                SELECT id FROM Color;
            "#
        )
        .fetch_all(mysql)
        .await?;

        // check if all color ids in frames are in db
        for frame in frames.iter() {
            for led in frame.leds.iter() {
                let mut found = false;
                for color in colors.iter() {
                    if led[0] == color.id {
                        found = true;
                        break;
                    }
                }
                if !found {
                    return Ok(LEDEffectResponse {
                        id: -1,
                        dancer_name,
                        part_name,
                        effect_name,
                        repeat,
                        effects: vec![],
                        ok: false,
                        msg: format!("Color Id {} not found", led[0]),
                    });
                }
            }
        }

        // check if effect name exists
        let effect_id = match sqlx::query!(
            r#"
                SELECT * from LEDEffect
                WHERE name = ? AND part_id = ? AND dancer_id = ?;
            "#,
            &effect_name,
            part_id,
            dancer_id
        )
        .fetch_one(mysql)
        .await
        {
            Ok(_) => {
                return Ok(LEDEffectResponse {
                    id: -1,
                    dancer_name,
                    part_name,
                    effect_name,
                    repeat,
                    effects: vec![],
                    ok: false,
                    msg: "effectName exists.".to_string(),
                })
            }
            Err(_) => sqlx::query!(
                r#"
                    INSERT INTO LEDEffect (name, dancer_id, part_id)
                    VALUES (?, ?, ?)
                "#,
                &effect_name,
                dancer_id,
                part_id
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
        };

        // insert frames into LEDEffectStates
        for frame in frames.iter() {
            for (i, led) in frame.leds.iter().enumerate() {
                let _ = sqlx::query!(
                    r#"
                        INSERT INTO LEDEffectState (effect_id, position, color_id, alpha)
                        VALUES (?, ?, ?, ?)
                    "#,
                    effect_id,
                    i as i32,
                    led[0],
                    led[1],
                )
                .execute(mysql)
                .await?;
            }
        }

        // publish to subscribers
        let led_payload = LEDPayload {
            create_effects: vec![LEDEffectData {
                id: effect_id,
                name: effect_name.clone(),
                dancer_name: dancer_name.clone(),
                part_name: part_name.clone(),
                repeat,
                frames: frames.clone(),
            }],
            update_effects: Vec::new(),
            delete_effects: Vec::new(),
        };

        Subscriptor::publish(led_payload);

        Ok(LEDEffectResponse {
            id: effect_id,
            dancer_name,
            part_name,
            effect_name,
            repeat: 0,
            effects: frames,
            ok: true,
            msg: "successfully added LED effect".to_string(),
        })
    }

    #[graphql(name = "editLEDEffect")]
    async fn edit_led_effect(
        &self,
        ctx: &Context<'_>,
        input: EditLEDInput,
    ) -> GQLResult<LEDEffectResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let id = input.id;
        let effect_name = input.name.clone();
        let repeat = input.repeat;
        let frames: Vec<LEDEffectFrame> = input
            .frames
            .set
            .iter()
            .map(|frame| LEDEffectFrame {
                leds: frame.leds.clone(),
                fade: frame.fade,
                start: frame.start,
            })
            .collect();

        // check if effect exists
        let led_effect = match sqlx::query!(
            r#"
                SELECT
                    LEDEffect.*,
                    Dancer.name as "dancer_name",
                    Part.name as "part_name"
                FROM LEDEffect
                INNER JOIN Dancer ON LEDEffect.dancer_id = Dancer.id
                INNER JOIN Part ON LEDEffect.part_id = Part.id
                WHERE LEDEffect.id = ?;
            "#,
            id
        )
        .fetch_one(mysql)
        .await
        {
            Ok(led_effect) => led_effect,
            Err(_) => {
                return Ok(LEDEffectResponse {
                    id: -1,
                    dancer_name: "".to_string(),
                    part_name: "".to_string(),
                    effect_name: "".to_string(),
                    repeat: 0,
                    effects: vec![],
                    ok: false,
                    msg: "effectName do not exist.".to_string(),
                })
            }
        };

        // check if effect is being edited by another user
        if let Ok(effect) = sqlx::query!(
            r#"
                SELECT * FROM EditingLEDEffect WHERE led_effect_id = ?;
            "#,
            id
        )
        .fetch_one(mysql)
        .await
        {
            if effect.user_id != context.user_id {
                return Err(GQLError::from(format!(
                    "This frame is being edited by user {}.",
                    effect.user_id
                )));
            }
        };

        // create array of all color ids from db
        let colors = sqlx::query!(
            r#"
                SELECT id FROM Color;
            "#
        )
        .fetch_all(mysql)
        .await?;

        // check if all color ids in frames are in db
        for frame in frames.iter() {
            for led in frame.leds.iter() {
                let mut found = false;
                for color in colors.iter() {
                    if led[0] == color.id {
                        found = true;
                        break;
                    }
                }
                if !found {
                    return Ok(LEDEffectResponse {
                        id: -1,
                        dancer_name: "".to_string(),
                        part_name: "".to_string(),
                        effect_name: "".to_string(),
                        repeat: 0,
                        effects: vec![],
                        ok: false,
                        msg: format!("Color Id {} not found", led[0]),
                    });
                }
            }
        }

        // update LEDEffect
        let _ = sqlx::query!(
            r#"
                UPDATE LEDEffect
                SET name = ?
                WHERE id = ?
            "#,
            &effect_name,
            id,
        )
        .execute(mysql)
        .await?;

        // update LEDEffectStates
        for frame in frames.iter() {
            for (i, led) in frame.leds.iter().enumerate() {
                let _ = sqlx::query!(
                    r#"
                        UPDATE LEDEffectState
                        SET color_id = ?, alpha = ?
                        WHERE position = ? AND effect_id = ?
                    "#,
                    led[0],
                    led[1],
                    i as i32,
                    id
                )
                .execute(mysql)
                .await?;
            }
        }

        let led_payload = LEDPayload {
            create_effects: Vec::new(),
            update_effects: vec![LEDEffectData {
                id,
                name: effect_name.clone(),
                dancer_name: led_effect.dancer_name.clone(),
                part_name: led_effect.part_name.clone(),
                repeat,
                frames: frames.clone(),
            }],
            delete_effects: Vec::new(),
        };

        Subscriptor::publish(led_payload);

        Ok(LEDEffectResponse {
            id,
            dancer_name: led_effect.dancer_name,
            part_name: led_effect.part_name,
            effect_name,
            repeat,
            effects: frames,
            ok: true,
            msg: "successfully edited LED effect".to_string(),
        })
    }

    #[graphql(name = "deleteLEDEffect")]
    async fn delete_led_effect(
        &self,
        ctx: &Context<'_>,
        id: i32,
    ) -> GQLResult<DeleteLEDEffectResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        // check if effect exists
        let led_effect = sqlx::query!(
            r#"
                SELECT * FROM LEDEffect WHERE id = ?;
            "#,
            id
        )
        .fetch_optional(mysql)
        .await;

        match led_effect {
            Ok(_) => {}
            Err(_) => {
                return Ok(DeleteLEDEffectResponse {
                    ok: false,
                    msg: format!("LEDEffect Id {} not found", id),
                })
            }
        };

        // check control data
        let control_frames = sqlx::query!(
            r#"
                SELECT frame_id FROM ControlData WHERE effect_id = ?;
            "#,
            id
        )
        .fetch_all(mysql)
        .await?;

        if !control_frames.is_empty() {
            let mut control_frames = control_frames
                .iter()
                .map(|frame| frame.frame_id)
                .collect::<Vec<i32>>();
            control_frames.sort();
            control_frames.dedup();

            return Ok(DeleteLEDEffectResponse {
                ok: false,
                msg: format!(
                    "LEDEffect Id {} is being used in control frames {:?}.",
                    id, control_frames
                ),
            });
        }

        // check if effect is being edited by another user
        if let Ok(effect) = sqlx::query!(
            r#"
                SELECT * FROM EditingLEDEffect WHERE led_effect_id = ?;
            "#,
            id
        )
        .fetch_one(mysql)
        .await
        {
            if effect.user_id != context.user_id {
                return Err(GQLError::from(format!(
                    "This frame is being edited by user {}.",
                    effect.user_id
                )));
            }
        };

        // delete from LEDEffectStates
        let _ = sqlx::query!(
            r#"
                DELETE FROM LEDEffectState
                WHERE effect_id = ?
            "#,
            id
        )
        .execute(mysql)
        .await?;

        // delete from LEDEffect
        let _ = sqlx::query!(
            r#"
                DELETE FROM LEDEffect
                WHERE id = ?
            "#,
            id
        )
        .execute(mysql)
        .await?;

        // publish to subscribers
        let led_payload = LEDPayload {
            create_effects: Vec::new(),
            update_effects: Vec::new(),
            delete_effects: vec![LEDEffectData {
                id: 0,
                name: "".to_string(),
                dancer_name: "".to_string(),
                part_name: "".to_string(),
                repeat: 0,
                frames: vec![],
            }],
        };

        Subscriptor::publish(led_payload);

        Ok(DeleteLEDEffectResponse {
            ok: true,
            msg: "successfully deleted LED effect".to_string(),
        })
    }
}
