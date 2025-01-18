use crate::db::types::{
    color::ColorData, control_frame::ControlFrameData, position_frame::PositionFrameData,
};
use crate::global;
use crate::types::global::PositionPos;
use crate::utils::data::{get_redis_control, get_redis_position};
use crate::utils::vector::partition_by_field;

use async_graphql::Enum;
use axum::{http::StatusCode, response::Json};
use http::header::CONTENT_TYPE;
use http::HeaderMap;
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use sqlx::Type;
use std::collections::BTreeMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct ExPositionData {
    pub start: i32,
    pub pos: Vec<PositionPos>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ExColorData(pub i32, pub i32, pub i32); // [r: number, g: number, b: number]

impl From<String> for ExPartType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "LED" => ExPartType::Led,
            "FIBER" => ExPartType::Fiber,
            _ => panic!("Invalid TPartType value: {}", data),
        }
    }
}

#[derive(Type, Enum, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Debug, Default)]
pub enum ExPartType {
    #[default]
    Led,
    Fiber,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExPartData {
    pub name: String,
    pub r#type: ExPartType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub length: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExDancerData {
    pub parts: Vec<ExPartData>,
    pub name: String,
    pub model: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ExLEDFrameLED(pub String, pub i32);

#[derive(Debug, Deserialize, Serialize)]
pub struct TExportLEDFrame {
    #[serde(rename = "LEDs")]
    pub leds: Vec<ExLEDFrameLED>,
    pub start: i32,
    pub fade: bool,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExLEDPart {
    pub repeat: i32,
    pub frames: Vec<TExportLEDFrame>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ExControlData {
    pub fade: bool,
    pub start: i32,
    pub status: Vec<Vec<ExPartControl>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ExPartControl(pub String, pub i32); // TLEDControl: [src: string, alpha: number] or TFiberControl: [color: string, alpha: number]

#[derive(Debug, Deserialize, Serialize)]
pub struct ExportDataResponse {
    pub dancer: Vec<ExDancerData>,
    pub color: BTreeMap<String, ExColorData>,
    pub position: BTreeMap<String, ExPositionData>,
    pub control: BTreeMap<String, ExControlData>,
    #[serde(rename = "LEDEffects")]
    pub led_effects: BTreeMap<String, BTreeMap<String, BTreeMap<String, ExLEDPart>>>,
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

    let mut color = BTreeMap::<String, ExColorData>::new();
    let mut color_dict = BTreeMap::new();

    // IColor
    for color_obj in color_data {
        color.insert(
            color_obj.name.to_string(),
            ExColorData(color_obj.r, color_obj.g, color_obj.b),
        );
        color_dict.insert(color_obj.id, color_obj.name.to_string());
    }

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

    let dancer: Vec<ExDancerData> = dancer_data
        .into_iter()
        .map(|dancer_obj| ExDancerData {
            name: dancer_obj[0].name.clone(),
            model: dancer_obj[0].model_name.clone(),
            parts: dancer_obj
                .into_iter()
                .map(|part| ExPartData {
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

            let mut led_part = BTreeMap::<String, ExLEDPart>::new();
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
                let led_frames = vec![TExportLEDFrame {
                    leds: led_effect_states
                        .iter()
                        .map(|led_effect_state| {
                            ExLEDFrameLED(
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
                    ExLEDPart {
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
                fade as "fade: bool", 
                meta_rev, 
                data_rev
            FROM ControlFrame
            ORDER BY start ASC;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;
    let mut control = BTreeMap::<String, ExControlData>::new();
    for control_frame in control_frames {
        let redis_contol = get_redis_control(redis, control_frame.id)
            .await
            .into_result()?;
        let fade = redis_contol.fade;
        let start = redis_contol.start;
        let status = redis_contol.status;
        let new_status: Vec<Vec<ExPartControl>> = status
            .into_iter()
            .enumerate()
            .map(|(dancer_idx, dancer_statue)| {
                dancer_statue
                    .into_iter()
                    .enumerate()
                    .map(|(part_idx, part_status)| {
                        let part_type = dancer[dancer_idx].parts[part_idx].r#type;
                        if part_type == ExPartType::Fiber {
                            if part_status.0 == -1 {
                                return ExPartControl(String::new(), part_status.1);
                            }
                            ExPartControl(color_dict[&part_status.0].clone(), part_status.1)
                        } else {
                            if part_status.0 == -1 {
                                return ExPartControl(String::new(), part_status.1);
                            }
                            ExPartControl(led_dict[&part_status.0].clone(), part_status.1)
                        }
                    })
                    .collect::<Vec<ExPartControl>>()
            })
            .collect();
        let new_cache_obj = ExControlData {
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
            SELECT * FROM PositionFrame
            ORDER BY start ASC;
        "#
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let mut position = BTreeMap::<String, ExPositionData>::new();

    for position_frame in position_frames {
        let redis_position = get_redis_position(redis, position_frame.id)
            .await
            .into_result()?;
        position.insert(
            position_frame.id.to_string(),
            ExPositionData {
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
                        ((dancer_pos.0 + f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.1 + f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.2 + f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.3 + f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.4 + f64::EPSILON) * 100.0).round() / 100.0,
                        ((dancer_pos.5 + f64::EPSILON) * 100.0).round() / 100.0,
                    )
                })
                .collect();
            position.insert(key, value);
        }
    }

    let mut header = HeaderMap::new();
    header.insert(CONTENT_TYPE, "application/json".parse().unwrap());

    let export_data_response = ExportDataResponse {
        position,
        control,
        dancer,
        color,
        led_effects,
    };

    Ok((StatusCode::OK, (header, Json(export_data_response))))
}
