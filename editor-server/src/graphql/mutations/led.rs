use crate::db::types::led_effect::LEDEffectData;
use crate::graphql::types::led::{Frame, InputFrame};
use crate::graphql::{
    subscriptions::led::{LEDMutationMode, LEDPayload},
    subscriptor::Subscriptor,
};
use crate::types::global::UserContext;
use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};
use serde::{Deserialize, Serialize};

#[derive(InputObject, Default, Debug)]
pub struct Set {
    set: Vec<InputFrame>,
}

#[derive(InputObject, Default, Debug)]
#[graphql(name = "LEDEffectCreateInput")]
pub struct LEDEffectCreateInput {
    pub name: String,
    pub part_name: String,
    pub repeat: i32,
    pub frames: Set,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug)]
pub struct LEDResponse {
    id: i32,
    part_name: String,
    effect_name: String,
    repeat: i32,
    effects: Vec<Frame>,
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
    ) -> GQLResult<LEDResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let effect_name = input.name.clone();
        let part_name = input.part_name.clone();
        let repeat = input.repeat;
        let frames: Vec<Frame> = input
            .frames
            .set
            .iter()
            .map(|frame| Frame {
                leds: frame.leds.clone(),
                fade: frame.fade,
                start: frame.start,
            })
            .collect();

        /*
           data: LEDEffectCreateInput { name: "ok", part_name: "part", repeat: 0, frames: [InputFrame { leds: [[1, 0]], fade: false, start: 0 }] }
        */

        let _part = match sqlx::query!(
            r#"
                SELECT * FROM Part WHERE name = ?;
            "#,
            &part_name
        )
        .fetch_one(mysql)
        .await
        {
            Ok(part) => part,
            Err(_) => {
                return Ok(LEDResponse {
                    id: -1,
                    part_name,
                    effect_name,
                    repeat,
                    effects: vec![],
                    ok: false,
                    msg: "No corresponding part.".to_string(),
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
                    return Ok(LEDResponse {
                        id: -1,
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

        let id = match sqlx::query!(
            r#"
                SELECT * from LEDEffect
                WHERE name = ? AND part_name = ?;
            "#,
            &effect_name,
            &part_name,
        )
        .fetch_one(mysql)
        .await
        {
            Ok(_) => {
                return Ok(LEDResponse {
                    id: -1,
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
                    INSERT INTO LEDEffect (name, part_name)
                    VALUES (?, ?)
                "#,
                &effect_name,
                &part_name,
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
        };

        let led_payload = LEDPayload {
            mutation: LEDMutationMode::Created,
            id,
            part_name: part_name.clone(),
            effect_name: effect_name.clone(),
            edit_by: context.user_id,
            data: LEDEffectData {
                id,
                name: effect_name.clone(),
                part_name: part_name.clone(),
                repeat,
                frames: frames.clone(),
            },
        };

        Subscriptor::publish(led_payload);

        Ok(LEDResponse {
            id,
            part_name,
            effect_name,
            repeat: 0,
            effects: frames,
            ok: true,
            msg: "successfully added LED effect".to_string(),
        })
    }
}
