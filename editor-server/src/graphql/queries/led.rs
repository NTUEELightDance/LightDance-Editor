//! LED query methods

use crate::graphql::types::{
    led::{LEDEffectFrame, LED},
    led_map::{LEDMap, LEDMapCustomScalar},
};
use crate::types::global::UserContext;
use crate::utils::vector::partition_by_field;

use async_graphql::{Context, Object, Result as GQLResult};
use itertools::Itertools;
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

        let led_effect_states = sqlx::query!(
            r#"
                SELECT
                    Model.id as "model_id",
                    Model.name as "model_name",
                    Part.id as "part_id",
                    Part.name as "part_name",
                    Part.length as "length!",
                    LEDEffect.id,
                    LEDEffect.name as "effect_name",
                    LEDEffectState.position,
                    LEDEffectState.color_id,
                    LEDEffectState.alpha
                FROM Model
                INNER JOIN Part ON Model.id = Part.model_id
                INNER JOIN LEDEffect ON Part.id = LEDEffect.part_id
                INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id
                WHERE Part.type = 'LED'
                ORDER BY Model.id ASC, Part.id ASC, LEDEffect.id ASC, LEDEffectState.position ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?;

        let mut result: HashMap<String, HashMap<String, HashMap<String, LED>>> = HashMap::new();

        let led_effect_states = partition_by_field(|row| row.model_id, led_effect_states)
            .into_iter()
            .map(|vector| {
                partition_by_field(|row| row.part_id, vector)
                    .into_iter()
                    .map(|vector| partition_by_field(|row| row.id, vector))
                    .collect_vec()
            })
            .collect_vec();

        led_effect_states.iter().for_each(|dancer_states| {
            let model_name = &dancer_states[0][0][0].model_name;
            let dancer = result.entry(model_name.clone()).or_insert(HashMap::new());

            dancer_states.iter().for_each(|part_states| {
                let part_name = &part_states[0][0].part_name;
                let part = dancer.entry(part_name.clone()).or_insert(HashMap::new());

                part_states.iter().for_each(|effect_states| {
                    let effect_name = &effect_states[0].effect_name;
                    let effect_id = effect_states[0].id;

                    let leds = effect_states
                        .iter()
                        .map(|state| {
                            let color_id = state.color_id;
                            let alpha = state.alpha;

                            [color_id, alpha]
                        })
                        .collect_vec();

                    part.entry(effect_name.clone()).or_insert(LED {
                        id: effect_id,
                        repeat: 0,
                        frames: vec![LEDEffectFrame {
                            leds,
                            fade: false,
                            start: 0,
                        }],
                    });
                });
            });
        });

        Ok(LEDMap {
            led_map: LEDMapCustomScalar(result),
        })
    }
}
