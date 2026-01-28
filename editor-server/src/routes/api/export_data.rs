use crate::db::types::{
    color::ColorData, control_frame::ControlFrameData, position_frame::PositionFrameData,
};
use crate::global;
use crate::types::global::{
    ControlData, Dancer, DancerPart, JsonData, LEDFrame, LEDPart, PartControlBulbs,
    PartControlString, PartType, PositionData,
};
use crate::utils::data::{get_redis_control, get_redis_position};
use crate::utils::vector::partition_by_field;

use axum::{
    http::{header::CONTENT_TYPE, HeaderMap, HeaderValue, StatusCode},
    response::Json,
};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct ExportDataFailedResponse {
    err: String,
}

trait IntoResult<T, E> {
    fn into_result(self) -> Result<T, E>;
}

impl<R, E> IntoResult<R, (StatusCode, Json<ExportDataFailedResponse>)> for Result<R, E>
where
    E: std::string::ToString,
{
    fn into_result(self) -> Result<R, (StatusCode, Json<ExportDataFailedResponse>)> {
        match self {
            Ok(ok) => Ok(ok),
            Err(err) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ExportDataFailedResponse {
                    err: err.to_string(),
                }),
            )),
        }
    }
}

pub async fn export_data(
) -> Result<(StatusCode, (HeaderMap, Json<JsonData>)), (StatusCode, Json<ExportDataFailedResponse>)>
{
    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();
    let redis = clients.redis_client();

    // grab color data
    let color_data = sqlx::query_as!(
        ColorData,
        r#"
            SELECT * FROM Color;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut color = BTreeMap::<String, [i32; 3]>::new();
    let mut color_dict = BTreeMap::new();

    // IColor
    for color_obj in color_data {
        color.insert(
            color_obj.name.to_string(),
            [color_obj.r, color_obj.g, color_obj.b],
        );
        color_dict.insert(color_obj.id, color_obj.name.to_string());
    }
    color_dict.insert(-1, "none".to_string());

    // grab dancer data include parts (INNER JOIN)
    let result = sqlx::query!(
        r#"
            SELECT
                Dancer.id,
                Dancer.name,
                Model.name as model_name,
                Part.name as part_name,
                Part.type as part_type,
                Part.length as part_length
            FROM Dancer
            INNER JOIN Model ON Dancer.model_id = Model.id
            INNER JOIN Part ON Part.model_id = Model.id
            ORDER BY Dancer.id ASC, Part.id ASC;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let dancer_data = partition_by_field(|row| row.id, result);

    let dancer: Vec<Dancer> = dancer_data
        .into_iter()
        .map(|dancer_obj| Dancer {
            name: dancer_obj[0].name.clone(),
            model: dancer_obj[0].model_name.clone(),
            parts: dancer_obj
                .into_iter()
                .map(|part| DancerPart {
                    name: part.part_name,
                    r#type: part.part_type.into(),
                    length: part.part_length,
                })
                .collect(),
        })
        .collect();

    // grab LEDEffect data (different schema)
    let led_models_parts = sqlx::query!(
        r#"
            SELECT
                Part.id AS part_id,
                Part.name AS part_name,
                Model.id AS model_id,
                Model.name AS model_name
            FROM Part
            INNER JOIN Model ON Model.id = Part.model_id
            WHERE type = "LED"
            ORDER BY Model.id ASC, Part.id ASC;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let led_dancer_parts = partition_by_field(|row| row.model_id, led_models_parts)
        .into_iter()
        .map(|parts| partition_by_field(|row| row.part_id, parts))
        .collect_vec();

    let mut led_effects = BTreeMap::new();
    let mut led_dict = BTreeMap::new();

    for dancer_parts in led_dancer_parts {
        for parts in dancer_parts {
            let model_id = parts[0].model_id;
            let model_name = &parts[0].model_name;

            let part_id = parts[0].part_id;
            let part_name = &parts[0].part_name;

            let mut led_part = BTreeMap::<String, LEDPart>::new();
            // LEDEffectState
            let led_effects_states = {
                let result = sqlx::query!(
                    r#"
                        SELECT
                            LEDEffect.id,
                            LEDEffect.name,
                            LEDEffect.part_id,
                            LEDEffectState.color_id,
                            LEDEffectState.alpha,
                            LEDEffectState.position
                        FROM LEDEffect
                        INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id
                        WHERE model_id = ? AND part_id = ?
                        ORDER BY LEDEffect.id ASC, LEDEffectState.position ASC;
                    "#,
                    model_id,
                    part_id
                )
                .fetch_all(mysql_pool)
                .await
                .into_result()?;

                partition_by_field(|row| row.id, result)
            };

            led_effects_states.iter().for_each(|led_effect_states| {
                let led_frames = vec![LEDFrame {
                    leds: led_effect_states
                        .iter()
                        .map(|led_effect_state| {
                            (
                                color_dict[&led_effect_state.color_id].clone(),
                                led_effect_state.alpha,
                            )
                        })
                        .collect(),
                    start: 0,
                    fade: false,
                }];

                led_part.insert(
                    led_effect_states[0].name.clone(),
                    LEDPart {
                        repeat: 0,
                        frames: led_frames,
                    },
                );
                led_dict.insert(led_effect_states[0].id, led_effect_states[0].name.clone());
            });

            led_effects
                .entry(model_name.clone())
                .or_insert(BTreeMap::new())
                .insert(part_name.clone(), led_part);
        }
    }

    // grab control data from redis
    let control_frames = sqlx::query_as!(
        ControlFrameData,
        r#"
            SELECT
                id,
                start,
                meta_rev, 
                data_rev
            FROM ControlFrame
            ORDER BY start ASC;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut control = BTreeMap::<String, ControlData>::new();

    for control_frame in control_frames {
        let redis_control = get_redis_control(redis, control_frame.id)
            .await
            .into_result()?;
        let start = redis_control.start;
        let status = redis_control.status;
        let led_status = redis_control.led_status;

        // TODO: figure out how this work & fix if needed
        let fade = redis_control.fade;
        let has_effect = redis_control.has_effect;

        let new_status: Vec<Vec<PartControlString>> = status
            .into_iter()
            .enumerate()
            .map(|(dancer_idx, dancer_status)| {
                dancer_status
                    .into_iter()
                    .enumerate()
                    .map(|(part_idx, part_status)| {
                        let part_type = dancer[dancer_idx].parts[part_idx].r#type;
                        match part_type {
                            PartType::FIBER => {
                                let color_id = part_status.0;
                                let alpha = part_status.1;
                                let _fade = part_status.2;
                                PartControlString(color_id.map(|id| color_dict[&id].clone()), alpha)
                            }
                            PartType::LED => {
                                let effect_id = part_status.0;
                                let alpha = part_status.1;
                                let _fade = part_status.2;
                                match effect_id {
                                    Some(0) => PartControlString(Some("".to_string()), alpha),
                                    Some(-1) => {
                                        PartControlString(Some("no-change".to_string()), alpha)
                                    }
                                    Some(id) => {
                                        PartControlString(Some(led_dict[&id].clone()), alpha)
                                    }
                                    None => PartControlString(None, alpha),
                                }
                            }
                        }
                    })
                    .collect::<Vec<PartControlString>>()
            })
            .collect();

        let new_led_status: Vec<Vec<PartControlBulbs>> = led_status
            .into_iter()
            .map(|dancer_led_status| {
                dancer_led_status
                    .into_iter()
                    .map(|part_led_status| {
                        part_led_status
                            .into_iter()
                            .map(|(color_id, alpha)| (color_dict[&color_id].clone(), alpha))
                            .collect::<PartControlBulbs>()
                    })
                    .collect()
            })
            .collect();

        let new_cache_obj = ControlData {
            start,
            status: new_status,
            led_status: new_led_status,
            fade,
            has_effect,
        };
        control.insert(control_frame.id.to_string(), new_cache_obj);
    }

    // grab position data from redis
    let position_frames = sqlx::query_as!(
        PositionFrameData,
        r#"
            SELECT * FROM PositionFrame
            ORDER BY start ASC;
        "#
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut position = BTreeMap::<String, PositionData>::new();

    for position_frame in position_frames {
        let redis_position = get_redis_position(redis, position_frame.id)
            .await
            .into_result()?;
        position.insert(
            position_frame.id.to_string(),
            PositionData {
                start: position_frame.start,
                location: redis_position.location,
                rotation: redis_position.rotation,
            },
        );
    }

    for key in position.keys().cloned().collect::<Vec<_>>() {
        if let Some(mut value) = position.remove(&key) {
            value.location = value
                .location
                .iter()
                .map(|dancer_position| {
                    [
                        dancer_position[0]
                            .map(|pos| ((pos + f64::EPSILON) * 100.0).round() / 100.0),
                        dancer_position[1]
                            .map(|pos| ((pos + f64::EPSILON) * 100.0).round() / 100.0),
                        dancer_position[2]
                            .map(|pos| ((pos + f64::EPSILON) * 100.0).round() / 100.0),
                        // ((dancer_position[0] + f64::EPSILON) * 100.0).round() / 100.0,
                        // ((dancer_position[1] + f64::EPSILON) * 100.0).round() / 100.0,
                        // ((dancer_position[2] + f64::EPSILON) * 100.0).round() / 100.0,
                    ]
                })
                .collect();
            position.insert(key, value);
        }
    }

    let mut header = HeaderMap::new();
    header.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    let export_data_response = JsonData {
        position,
        control,
        dancer,
        color,
        led_effects,
    };

    Ok((StatusCode::OK, (header, Json(export_data_response))))
}
