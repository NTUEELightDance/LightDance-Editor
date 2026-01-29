use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};

use itertools::Itertools;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::global;

type GetDataResponse = Vec<u8>;

#[derive(Debug, Deserialize, Serialize)]
struct LEDPart {
    id: i32,
    len: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetControlDatQuery {
    dancer: String,
    #[serde(rename = "OFPARTS")]
    of_parts: HashMap<String, i32>,
    #[serde(rename = "LEDPARTS")]
    led_parts: HashMap<String, LEDPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetDataFailedResponse {
    err: String,
}

trait IntoResult<T, E> {
    fn into_result(self) -> Result<T, E>;
}

fn write_little_endian(num: &u32, v: &mut Vec<u8>) {
    let mut window: u32 = 0xFF;
    for _ in 0..4 {
        v.push((num & window).try_into().unwrap());
        window <<= 8;
    }
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

const VERSION: [u8; 2] = [0, 0];

pub async fn control_dat(
    query: Json<GetControlDatQuery>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
    let mut response: Vec<u8> = Vec::new();
    let GetControlDatQuery {
        dancer,
        of_parts,
        led_parts,
    } = query.0;

    for vi in VERSION {
        response.push(vi);
    }

    let of_num: u8 = of_parts.len().try_into().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(GetDataFailedResponse {
                err: "Optical Fiber number out of bounds".to_string(),
            }),
        )
    })?;

    response.push(of_num);

    let strip_num: u8 = led_parts.len().try_into().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(GetDataFailedResponse {
                err: "LED strip number out of bounds".to_string(),
            }),
        )
    })?;

    response.push(strip_num);

    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();

    // let mut parts_filter = HashSet::new();
    // led_parts.keys().for_each(|part_name| {
    //     parts_filter.insert(part_name);
    // });

    // TODO: Do some checks on input validity

    // let part_data = sqlx::query!(
    //     r#"
    //         SELECT
    //             Part.name as "part_name",
    //             Part.length
    //         FROM Dancer
    //         INNER JOIN Model
    //             ON Dancer.model_id = Model.id
    //         INNER JOIN Part
    //             ON Model.id = Part.model_id
    //         WHERE Dancer.name = ?
    //     "#,
    //     dancer
    // )
    // .fetch_all(mysql_pool)
    // .await
    // .into_result()?
    // .into_iter()
    // .filter(|data| parts_filter.contains(&data.part_name))
    // .collect_vec();
    //
    // if part_data.is_empty() {
    //     return Err((
    //         StatusCode::BAD_REQUEST,
    //         Json(GetDataFailedResponse {
    //             err: "Dancer parts not found.".to_string(),
    //         }),
    //     ));
    // }
    //
    // let mut part_data_map: HashMap<String, u8> = HashMap::new();
    //
    // for part in part_data {
    //     let len = part.length.ok_or("part length not found").into_result()? as u8;
    //     part_data_map.insert(part.part_name, len);
    // }

    // TODO: insert in order specified by the firmware team
    for (_, part) in led_parts {
        response.push(part.len as u8);
    }

    let frame_data = sqlx::query!(
        r#"
            SELECT
                ControlFrame.start as "control_frame_start"
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
    .collect_vec();

    response.push(frame_data.len().try_into().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(GetDataFailedResponse {
                err: "number out of bounds".to_string(),
            }),
        )
    })?);

    frame_data.iter().for_each(|f| {
        write_little_endian(&(f.control_frame_start as u32), &mut response);
    });

    let mut headers = HeaderMap::new();
    headers.insert("content-type", HeaderValue::from_static("application/json"));

    Ok((StatusCode::OK, (headers, Json(response))))
}
