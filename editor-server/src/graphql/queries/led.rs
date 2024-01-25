//! LED query methods

use crate::graphql::types::{
    led::{LEDEffectFrame, LED},
    led_map::{LEDMap, LEDMapCustomScalar},
};
use crate::types::global::UserContext;
use async_graphql::{Context, Object, Result as GQLResult};
use std::collections::HashMap;

#[derive(Default)]
pub struct LEDQuery;

#[Object]
impl LEDQuery {
    #[graphql(name = "LEDMap")]
    async fn led_map(&self, ctx: &Context<'_>) -> GQLResult<LEDMap> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        let led_effect_states = sqlx::query!(
            r#"
                SELECT Part.name as "part_name", Part.length as "length!", LEDEffect.name as "effect_name", LEDEffect.id, LEDEffectState.position, LEDEffectState.color_id, LEDEffectState.alpha FROM Part
                INNER JOIN LEDEffect ON Part.name = LEDEffect.part_name
                INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id
                WHERE Part.type = 'LED'
            "#,
        ).fetch_all(mysql).await.unwrap();

        let mut result: HashMap<String, HashMap<String, LED>> = HashMap::new();

        for led_effect_state in led_effect_states.iter() {
            let part = result
                .entry(led_effect_state.part_name.clone())
                .or_insert(HashMap::new());
            let led_effect = part
                .entry(led_effect_state.effect_name.clone())
                .or_insert(LED {
                    id: led_effect_state.id,
                    repeat: 0,
                    frames: vec![LEDEffectFrame {
                        leds: vec![[0, 0]; led_effect_state.length as usize],
                        fade: false,
                        start: 0,
                    }],
                });

            led_effect.frames[0].leds[led_effect_state.position as usize] =
                [led_effect_state.color_id, led_effect_state.alpha];
        }

        Ok(LEDMap {
            led_map: LEDMapCustomScalar(result),
        })
    }
}
