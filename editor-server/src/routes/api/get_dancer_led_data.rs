use crate::global;
use crate::utils::vector::partition_by_field;

use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};
use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::collections::HashSet;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Status {
    start: i32,
    status: Vec<[i32; 4]>,
    fade: bool,
}

pub type GetDataResponse = HashMap<String, Vec<Status>>;

#[derive(Debug, Deserialize, Serialize)]
pub struct GetDataFailedResponse {
    err: String,
}

#[derive(Debug)]
struct Part {
    length: Option<i32>,
    effect_id: Option<i32>,
    start: i32,
    fade: bool,
}

#[derive(Debug)]
struct Color {
    r: i32,
    g: i32,
    b: i32,
}

#[derive(Debug, Deserialize, Serialize)]
struct GetLEDDataQueryLEDPart {
    id: i32,
    len: i32,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct GetLEDDataQuery {
    dancer: String,
    #[serde(rename = "LEDPARTS")]
    led_parts: HashMap<String, GetLEDDataQueryLEDPart>,
    #[serde(rename = "LEDPARTS_MERGE")]
    led_parts_merge: HashMap<String, Vec<String>>,
}

trait IntoResult<T, E> {
    fn into_result(self) -> Result<T, E>;
}

impl<R, E> IntoResult<R, (StatusCode, Json<GetDataFailedResponse>)> for Result<R, E>
where
    E: std::string::ToString,
{
    fn into_result(self) -> Result<R, (StatusCode, Json<GetDataFailedResponse>)> {
        match self {
            Ok(ok) => Ok(ok),
            Err(err) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(GetDataFailedResponse {
                    err: err.to_string(),
                }),
            )),
        }
    }
}

fn convert_true_color_wo_norm(color: &[i32; 4]) -> [i32; 3] {
    [
        color[0] * color[3],
        color[1] * color[3],
        color[2] * color[3],
    ]
}

fn check_same_status(s1: &Status, s2: &Status) -> bool {
    if s1.status.len() != s2.status.len() {
        return false;
    }

    for (c1, c2) in s1.status.iter().zip(s2.status.iter()) {
        let c1 = convert_true_color_wo_norm(c1);
        let c2 = convert_true_color_wo_norm(c2);
        if c1 != c2 {
            return false;
        }
    }

    true
}

fn filter_identical_frames(statuses: Vec<Status>) -> Vec<Status> {
    let length = statuses.len();
    let mut identical_and_fade = vec![(false, false); statuses.len()];
    for (i, status) in statuses.iter().enumerate() {
        identical_and_fade[i] = (
            i != length - 1 && check_same_status(status, &statuses[i + 1]),
            status.fade,
        );
    }

    // Remove executive identical frames
    let mut keep_frame = vec![true; statuses.len()];
    for (i, (identical, _fade)) in identical_and_fade.iter().enumerate() {
        // Must keep if previous frame is not the same
        if i > 0 {
            let prev = identical_and_fade[i - 1];
            if !prev.0 || !identical {
                continue;
            }
        } else {
            continue;
        }

        keep_frame[i] = false;
    }

    statuses
        .into_iter()
        .zip(keep_frame)
        .filter_map(|(status, keep)| if keep { Some(status) } else { None })
        .collect_vec()
}

pub async fn get_dancer_led_data(
    query: Json<GetLEDDataQuery>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
    // let query = match query {
    //     Some(query) => query.0,
    //     None => {
    //         return Err((
    //             StatusCode::BAD_REQUEST,
    //             Json(GetDataFailedResponse {
    //                 err: "Query not found.".to_string(),
    //             }),
    //         ))
    //     }
    // };

    let GetLEDDataQuery {
        dancer,
        led_parts: required_parts,
        led_parts_merge: parts_merge,
    } = query.0;

    let mut parts_filter = HashSet::new();
    required_parts
        .keys()
        .for_each(|part_name| match parts_merge.get(part_name) {
            Some(merge_parts) => {
                merge_parts.iter().for_each(|part| {
                    parts_filter.insert(part);
                });
            }
            None => {
                parts_filter.insert(part_name);
            }
        });

    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();

    let colors = sqlx::query!(
        r#"
            SELECT Color.r, Color.g, Color.b, Color.id
            FROM Color
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    // create hashmap for color
    let mut color_map: HashMap<i32, Color> = HashMap::new();
    for color in colors.iter() {
        color_map.insert(
            color.id,
            Color {
                r: color.r,
                g: color.g,
                b: color.b,
            },
        );
    }

    let effect_states = sqlx::query!(
        r#"
            SELECT
                LEDEffectState.color_id,
                LEDEffectState.alpha,
                LEDEffectState.position,
                LEDEffectState.effect_id
            FROM LEDEffectState
            ORDER BY LEDEffectState.effect_id, LEDEffectState.position;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let effect_states = partition_by_field(|state| state.effect_id, effect_states);

    let mut effect_states_map: HashMap<i32, Vec<[i32; 4]>> = HashMap::new();
    for states in effect_states.iter() {
        let effect_id = states[0].effect_id;

        let mut effect_data = vec![[0, 0, 0, 0]; states.len()];

        for state in states.iter() {
            let color = color_map
                .get(&state.color_id)
                .unwrap_or(&Color { r: 0, g: 0, b: 0 });
            effect_data[state.position as usize] = [color.r, color.g, color.b, state.alpha];
        }

        effect_states_map.insert(effect_id, effect_data);
    }

    // get parts and control data of parts for dancer
    let dancer_data = sqlx::query!(
        r#"
            SELECT
                Dancer.name,
                Dancer.id,
                Part.name as "part_name",
                Part.id as "part_id",
                Part.length as "part_length",
                ControlData.effect_id,
                ControlFrame.start,
                ControlFrame.fade
            FROM Dancer
            INNER JOIN Model
                ON Dancer.model_id = Model.id
            INNER JOIN Part
                ON Model.id = Part.model_id
            INNER JOIN ControlData
                ON Part.id = ControlData.part_id AND
                ControlData.dancer_id = Dancer.id
            INNER JOIN ControlFrame
                ON ControlData.frame_id = ControlFrame.id
            WHERE Dancer.name = ? AND Part.type = 'LED'
            ORDER BY ControlFrame.start
        "#,
        dancer
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?
    .into_iter()
    .filter(|data| parts_filter.contains(&data.part_name))
    .collect_vec();

    if dancer_data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(GetDataFailedResponse {
                err: "Dancer not found.".to_string(),
            }),
        ));
    }

    let mut fetched_parts: HashMap<String, Vec<Part>> = HashMap::new();

    // organize control data into their respective parts
    for data in dancer_data.into_iter() {
        fetched_parts.entry(data.part_name).or_default().push(Part {
            length: data.part_length,
            effect_id: data.effect_id,
            start: data.start,
            fade: data.fade == 1,
        });
    }

    let mut response: GetDataResponse = HashMap::new();

    for (part_name, _) in required_parts.iter() {
        match parts_merge.get(part_name) {
            Some(parts) => {
                let mut frame_effect_datas = HashMap::new();

                for sub_part_name in parts.iter() {
                    let control_data = fetched_parts.get(sub_part_name);

                    if let Some(control_data) = control_data {
                        for data in control_data.iter() {
                            let start = data.start;
                            let fade = data.fade;
                            let length = data.length.ok_or("Length not found").into_result()?;

                            if let Some(effect_id) = data.effect_id {
                                let effect_data = effect_states_map
                                    .get(&effect_id)
                                    .ok_or("Effect data not found")
                                    .into_result()?
                                    .clone();

                                frame_effect_datas
                                    .entry(start)
                                    .or_insert((start, fade, Vec::new()))
                                    .2
                                    .extend_from_slice(&effect_data);
                            } else {
                                let previous_part_status = match response.get(part_name) {
                                    Some(status) => status.last().unwrap().status.clone(),
                                    None => vec![[0, 0, 0, 0]; length as usize],
                                };

                                frame_effect_datas
                                    .entry(start)
                                    .or_insert((start, fade, Vec::new()))
                                    .2
                                    .extend_from_slice(&previous_part_status);
                            }
                        }
                    }
                }

                let mut part_data = Vec::<Status>::new();

                for (_, (start, fade, effect_datas)) in frame_effect_datas {
                    part_data.push(Status {
                        start,
                        fade,
                        status: effect_datas,
                    });
                }

                part_data.sort_by_key(|status| status.start);
                response.insert(part_name.clone(), filter_identical_frames(part_data));
            }
            None => {
                let control_data = fetched_parts.get(part_name);

                if let Some(control_data) = control_data {
                    let mut part_data = Vec::<Status>::new();

                    for data in control_data.iter() {
                        let start = data.start;
                        let fade = data.fade;
                        let length = data.length.ok_or("Length not found").into_result()?;

                        if let Some(effect_id) = data.effect_id {
                            let effect_data = effect_states_map
                                .get(&effect_id)
                                .ok_or("Effect data not found")
                                .into_result()?
                                .clone();

                            part_data.push(Status {
                                start,
                                status: effect_data,
                                fade,
                            });
                        } else {
                            let previous_part_status = match part_data.last() {
                                Some(status) => status.status.clone(),
                                None => vec![[0, 0, 0, 0]; length as usize],
                            };

                            part_data.push(Status {
                                start,
                                status: previous_part_status,
                                fade,
                            });
                        }
                    }

                    part_data.sort_by_key(|status| status.start);
                    response.insert(part_name.clone(), filter_identical_frames(part_data));
                }
            }
        }
    }

    let mut headers = HeaderMap::new();
    headers.insert("content-type", HeaderValue::from_static("application/json"));

    // return data of form {part_name: [{status: [[r, g, b, a], [r, g, b, a]]}, ...}, ...]
    // index of status array is position of led

    Ok((StatusCode::OK, (headers, Json(response))))
}
