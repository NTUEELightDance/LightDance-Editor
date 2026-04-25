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

#[derive(Debug, Deserialize, Serialize)]
pub struct Frame {
    start: i32,
    fade: bool,
    status: HashMap<String, [i32; 4]>,
}

pub type GetDataResponse = Vec<Frame>;

#[derive(Debug, Deserialize, Serialize)]
pub struct GetDataFailedResponse {
    err: String,
}

#[derive(Debug, Default)]
struct FrameData {
    // id: i32,
    start_time: u32,
    fade: u8,
    name_id_map: HashMap<i32, String>,
    // (part_id, color)
    of_grb_data: HashMap<i32, [i32; 4]>,
}

type Color = [i32; 3];
type LEDStatus = [i32; 4];

const DEFAULT_COLOR: Color = [0, 0, 0];

#[derive(Debug, Deserialize, Serialize)]
pub struct GetFiberDataQuery {
    dancer: String,
    #[serde(rename = "OFPARTS")]
    of_parts: HashMap<String, i32>,
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

fn interpolate_no_effect_of(
    frames: &mut [FrameData],
    intervals: &HashMap<i32, Vec<(usize, usize)>>,
) {
    for (part_id, part_intervals) in intervals {
        for interval in part_intervals {
            let left_color = *frames[interval.0].of_grb_data.get(part_id).unwrap();
            let right_color = *frames[interval.1].of_grb_data.get(part_id).unwrap();
            let len = interval.1 - interval.0;

            for i in 0..len {
                *frames[interval.0 + i].of_grb_data.get_mut(part_id).unwrap() = [
                    (left_color[0] * (len - i) as i32 + right_color[0] * i as i32) / len as i32,
                    (left_color[1] * (len - i) as i32 + right_color[1] * i as i32) / len as i32,
                    (left_color[2] * (len - i) as i32 + right_color[2] * i as i32) / len as i32,
                    (left_color[3] * (len - i) as i32 + right_color[3] * i as i32) / len as i32,
                ]
            }
        }
    }
}

pub async fn get_dancer_fiber_data(
    query: Json<GetFiberDataQuery>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();

    let GetFiberDataQuery { dancer, of_parts } = query.0;

    let colors = sqlx::query!(
        r#"
            SELECT Color.r, Color.g, Color.b, Color.id
            FROM Color
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    // (id, color)
    let color_map: HashMap<i32, Color> = HashMap::from_iter(
        colors
            .iter()
            .map(|color| (color.id, [color.r, color.g, color.b])),
    );

    let of_filter: HashSet<String> = HashSet::from_iter(of_parts.iter().map(|part| part.0.clone()));

    let dancer_id = sqlx::query!(
        r#"
            SELECT
                Dancer.id
            FROM Dancer
            WHERE Dancer.name = ?
        "#,
        dancer
    )
    .fetch_one(mysql_pool)
    .await
    .map_err(|_| {
        (
            StatusCode::NOT_FOUND,
            Json(GetDataFailedResponse {
                err: "Dancer not found.".to_string(),
            }),
        )
    })?
    .id;

    let mut of_parts = Vec::from_iter(of_parts.into_iter());
    of_parts.sort_by_key(|part| part.1);

    let of_data = sqlx::query!(
        r#"
            SELECT
                Part.id as "part_id",
                Part.name as "part_name",
                ControlFrame.id as "contorl_frame_id",
                ControlData.color_id as "color_id",
                ControlData.alpha
            FROM Dancer
            INNER JOIN Model
                ON Model.id = Dancer.model_id
            INNER JOIN Part
                ON Part.model_id = Model.id
            INNER JOIN ControlData
                ON ControlData.part_id = Part.id AND
                ControlData.dancer_id = Dancer.id
            INNER JOIN ControlFrame
                ON ControlFrame.id = ControlData.frame_id
            WHERE Dancer.id = ? AND
                Part.type = 'FIBER' AND
                ControlData.type != 'NO_EFFECT'
            ORDER BY ControlFrame.start ASC;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?
    .into_iter()
    .filter(|data| of_filter.contains(&data.part_name))
    .collect_vec();

    let of_parts_ids: HashMap<String, i32> = HashMap::from_iter(
        of_data
            .iter()
            .map(|part| (part.part_name.clone(), part.part_id)),
    );

    let of_parts: Vec<(String, i32)> = Vec::from_iter(
        of_parts
            .into_iter()
            .map(|part| (part.0.clone(), *of_parts_ids.get(&part.0).unwrap())),
    );

    // ((frame_id, part_id), color)
    // TODO: error handling for the code below
    let of_data_map: HashMap<(i32, i32), LEDStatus> =
        HashMap::from_iter(of_data.iter().map(|data| {
            let color = match data.color_id {
                Some(id) => color_map.get(&id).unwrap_or(&[0, 0, 0]),
                None => &DEFAULT_COLOR,
            };

            (
                (data.contorl_frame_id, data.part_id),
                [color[0], color[1], color[2], data.alpha.unwrap_or(255)],
            )
        }));

    let control_frames = sqlx::query!(
        r#"
            SELECT
                ControlFrame.id,
                ControlFrame.start,
                ControlData.type,
                ControlData.part_id,
                ControlData.fade
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
            WHERE Dancer.id = ?
            ORDER BY ControlFrame.start;
        "#,
        dancer_id
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    let control_frames = partition_by_field(|cf| cf.start, control_frames);

    let mut frames: Vec<FrameData> = Vec::new();

    // ((frame_id, part_id), [[l, r)])
    let mut of_no_effect_intervals: HashMap<i32, Vec<(usize, usize)>> = HashMap::new();
    let mut of_no_effect_intervals_left: HashMap<i32, i32> = HashMap::new();
    let mut no_effect_parts: HashSet<(i32, i32)> = HashSet::new();

    for (i, frame) in control_frames.iter().enumerate() {
        let frame_id = frame[0].id;
        let start_time = frame[0].start as u32;
        let fade: u8 = match frame[0].fade {
            Some(f) => f as u8,
            None => {
                frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .fade
            }
        };

        for control_data in frame {
            if control_data.r#type == "NO_EFFECT" {
                no_effect_parts.insert((frame_id, control_data.part_id));
            }
        }

        // (part_id, color)
        let mut of: HashMap<i32, LEDStatus> = HashMap::new();

        let mut name_id_map = HashMap::<i32, String>::new();

        for (part_name, of_part_id) in &of_parts {
            name_id_map.insert(*of_part_id, part_name.clone());
            let color = if no_effect_parts.contains(&(frame_id, *of_part_id)) {
                *frames
                    .last()
                    .ok_or("first frame can't be no effect")
                    .into_result()?
                    .of_grb_data
                    .get(of_part_id)
                    .unwrap()
            } else {
                *of_data_map.get(&(frame_id, *of_part_id)).unwrap()
            };

            of.insert(*of_part_id, color);

            if no_effect_parts.contains(&(frame_id, *of_part_id)) && fade == 1 {
                if *of_no_effect_intervals_left.entry(*of_part_id).or_insert(-1) == -1 {
                    *of_no_effect_intervals_left.get_mut(of_part_id).unwrap() = i as i32;
                }
            } else {
                let left = of_no_effect_intervals_left.entry(*of_part_id).or_insert(-1);

                if *left != -1 {
                    of_no_effect_intervals
                        .entry(*of_part_id)
                        .or_default()
                        .push(((*left - 1) as usize, i));

                    *left = -1;
                }
            }
        }

        let frame_data = FrameData {
            // id: frame_id,
            start_time,
            of_grb_data: of,
            name_id_map,
            fade,
        };

        frames.push(frame_data);
    }

    interpolate_no_effect_of(&mut frames, &of_no_effect_intervals);

    let mut response: GetDataResponse = Vec::new();

    for frame in frames {
        let start_time = frame.start_time;
        let fade = frame.fade == 1;
        // status: HashMap<String, [i32; 4]>,
        let mut status: HashMap<String, [i32; 4]> = HashMap::new();

        for (id, stat) in frame.of_grb_data {
            let part_name = frame.name_id_map.get(&id).unwrap().clone();
            status.insert(part_name, stat);
        }

        response.push(Frame {
            start: start_time as i32,
            fade,
            status,
        })
    }

    let mut headers = HeaderMap::new();
    headers.insert("content-type", HeaderValue::from_static("application/json"));

    Ok((StatusCode::OK, (headers, Json(response))))
}
