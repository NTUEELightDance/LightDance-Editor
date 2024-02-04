use crate::db::types::{
    color::ColorData, control_frame::ControlFrameData, part::PartData,
    position_frame::PositionFrameData,
};
use crate::global;
use crate::types::global::{
    LEDEffectData, LEDEffectFrame, PositionPos, TColorData, TControlData, TDancerData, TExportData,
    TExportLEDFrame, TExportLEDFrameLED, TExportLEDPart, TPartControl, TPartData, TPartType,
    TPositionData, LED,
};
use crate::utils::data::{get_redis_control, get_redis_position};
use crate::utils::vector::partition_by_field;
use axum::{http::StatusCode, response::Json};
use http::header::CONTENT_TYPE;
use http::HeaderMap;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

#[derive(Debug, Deserialize, Serialize)]
pub struct ExportDataResponse {
    pub data: TExportData,
}

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

pub async fn export_data() -> Result<
    (StatusCode, (HeaderMap, Json<ExportDataResponse>)),
    (StatusCode, Json<ExportDataFailedResponse>),
> {
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

    let mut color = HashMap::<String, TColorData>::new();
    let mut color_dict = HashMap::<String, String>::new();

    // IColor
    for color_obj in color_data {
        color.insert(
            color_obj.name.to_string(),
            TColorData(color_obj.r, color_obj.g, color_obj.b),
        );
        color_dict.insert(color_obj.id.to_string(), color_obj.name.to_string());
    }

    // grab dancer data include parts (INNER JOIN)
    let result = sqlx::query!(
        r#"
            SELECT
                Dancer.id,
                Dancer.name,
                Part.name as part_name,
                Part.type as part_type,
                Part.length as part_length
            FROM Dancer
            INNER JOIN Part ON Part.dancer_id = Dancer.id
            ORDER BY Dancer.id ASC, Part.id ASC;
		"#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let dancer_data = partition_by_field(|row| row.id, result);

    let dancer: Vec<TDancerData> = dancer_data
        .into_iter()
        .map(|dancer_obj| TDancerData {
            name: dancer_obj[0].name.clone(),
            position_data: None,
            parts: dancer_obj
                .into_iter()
                .map(|part| TPartData {
                    name: part.part_name,
                    r#type: part.part_type.into(),
                    length: part.part_length,
                })
                .collect(),
        })
        .collect();

    // grab LEDEffect data (different schema)
    let led_parts = sqlx::query_as!(
        PartData,
        r#"
			SELECT * FROM Part
			WHERE type = "LED";
		"#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut seen = HashSet::new();
    let led_parts_name = led_parts
        .iter()
        .filter_map(|part| {
            if seen.insert(part.name.clone()) {
                Some(part.name.clone())
            } else {
                None
            }
        })
        .collect::<Vec<String>>();

    let mut led_effects = HashMap::<String, HashMap<String, TExportLEDPart>>::new();
    let mut led_dict = HashMap::<String, String>::new();

    for part_name in led_parts_name {
        let mut led_part = HashMap::<String, TExportLEDPart>::new();
        // LEDEffectState
        let result = {
            let result = sqlx::query!(
                r#"
				SELECT
                    LEDEffect.id,
                    LEDEffect.name,
                    LEDEffect.part_name,
                    LEDEffectState.color_id,
                    LEDEffectState.alpha,
                    LEDEffectState.position
                FROM LEDEffect
                INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id
				WHERE part_name = ?;
			"#,
                part_name
            )
            .fetch_all(mysql_pool)
            .await
            .into_result()?;
            partition_by_field(|row| row.id, result)
        };
        let led_part_effects = result
            .iter()
            .map(|led_effect_states| {
                let leds = led_effect_states
                    .iter()
                    .map(|effect| LED(effect.color_id, effect.alpha))
                    .collect::<Vec<LED>>();

                LEDEffectData {
                    id: led_effect_states[0].id,
                    name: led_effect_states[0].name.clone(),
                    part_name: led_effect_states[0].part_name.clone(),
                    repeat: 0,
                    frames: vec![LEDEffectFrame {
                        leds,
                        fade: false,
                        start: 0,
                    }],
                }
            })
            .collect_vec();
        let _: () = led_part_effects
            .iter()
            .map(|led_part_effect| {
                let led_frames: Vec<TExportLEDFrame> = led_part_effect
                    .frames
                    .clone()
                    .iter()
                    .map(|led_frame| {
                        let leds: Vec<TExportLEDFrameLED> = led_frame
                            .leds
                            .clone()
                            .into_iter()
                            .map(|led| {
                                vec![TExportLEDFrameLED(
                                    color_dict[&led.0.to_string()].clone(),
                                    led.1,
                                )]
                            })
                            .flatten()
                            .collect();
                        let led_frame_data = TExportLEDFrame {
                            leds,
                            start: led_frame.start,
                            fade: led_frame.fade,
                        };
                        led_frame_data
                    })
                    .collect();
                led_part.insert(
                    led_part_effect.name.clone(),
                    TExportLEDPart {
                        repeat: led_part_effect.repeat,
                        frames: led_frames,
                    },
                );
                led_dict.insert(led_part_effect.id.to_string(), led_part_effect.name.clone());
            })
            .collect();
        led_effects.insert(part_name, led_part);
    }

    // grab control data from redis
    let control_frames = sqlx::query_as!(
        ControlFrameData,
        r#"
			SELECT id, start, fade as "fade: bool"
            FROM ControlFrame;
		"#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;
    let mut control = HashMap::<String, TControlData>::new();
    for control_frame in control_frames {
        let redis_contol = get_redis_control(redis, control_frame.id)
            .await
            .into_result()?;
        let fade = redis_contol.fade;
        let start = redis_contol.start;
        let status = redis_contol.status;
        let new_status: Vec<Vec<TPartControl>> = status
            .into_iter()
            .enumerate()
            .map(|(dancer_idx, dancer_statue)| {
                dancer_statue
                    .into_iter()
                    .enumerate()
                    .map(|(part_idx, part_status)| {
                        let part_type = dancer[dancer_idx].parts[part_idx].r#type;
                        if part_type == TPartType::FIBER {
                            if part_status.0 == -1 {
                                return TPartControl(String::new(), part_status.1);
                            }
                            return TPartControl(
                                color_dict[&part_status.0.to_string()].clone(),
                                part_status.1,
                            );
                        } else {
                            if part_status.0 == -1 {
                                return TPartControl(String::new(), part_status.1);
                            }
                            return TPartControl(
                                color_dict[&part_status.0.to_string()].clone(),
                                part_status.1,
                            );
                        }
                    })
                    .collect::<Vec<TPartControl>>()
            })
            .collect();
        let new_cache_obj = TControlData {
            fade,
            start,
            status: new_status,
        };
        control.insert(control_frame.id.to_string(), new_cache_obj);
    }

    // grab position data from redis
    let position_frames = sqlx::query_as!(
        PositionFrameData,
        r#"
            SELECT * FROM PositionFrame;
        "#
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut position = HashMap::<String, TPositionData>::new();

    for position_frame in position_frames {
        let redis_position = get_redis_position(redis, position_frame.id)
            .await
            .into_result()?;
        position.insert(
            position_frame.id.to_string(),
            TPositionData {
                start: position_frame.start,
                pos: redis_position.pos,
            },
        );
    }

    for key in position.keys().cloned().collect::<Vec<_>>() {
        if let Some(mut value) = position.remove(&key) {
            value.pos = value
                .pos
                .iter()
                .map(|dancer_pos| {
                    PositionPos(
                        ((dancer_pos.0 + std::f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.1 + std::f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.2 + std::f64::EPSILON) * 100.0).round() / 100.0,
                    )
                })
                .collect();
            position.insert(key, value);
        }
    }

    let data = TExportData {
        position,
        control,
        dancer,
        color,
        led_effects,
    };

    let mut header = HeaderMap::new();
    header.insert(CONTENT_TYPE, "application/json".parse().unwrap());

    let export_data_response = ExportDataResponse { data };

    Ok((StatusCode::OK, (header, Json(export_data_response))))
}
