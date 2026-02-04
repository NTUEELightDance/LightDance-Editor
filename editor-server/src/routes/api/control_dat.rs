use std::collections::{BTreeMap, BTreeSet, HashMap, HashSet};

use axum::{
    body::Bytes,
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};

use super::types::{GetControlDatQuery, GetDataFailedResponse, LEDPart};
use super::utils::{write_little_endian, IntoResult};
use itertools::Itertools;

use crate::global;

const VERSION: [u8; 2] = [1, 1];
const TOTAL_OF_NUM: usize = 40;
const TOTAL_STRIP_NUM: usize = 8;

pub async fn control_dat(
    query: Json<GetControlDatQuery>,
) -> Result<(StatusCode, (HeaderMap, Bytes)), (StatusCode, Json<GetDataFailedResponse>)> {
    let mut response: Vec<u8> = Vec::new();
    for v in VERSION {
        response.push(v);
    }

    let GetControlDatQuery {
        dancer,
        of_parts,
        led_parts,
    } = query.0;

    let mut of_parts = Vec::from_iter(of_parts.into_iter());
    of_parts.sort_unstable_by_key(|part| part.1);
    let mut led_parts = Vec::from_iter(led_parts.into_iter());
    led_parts.sort_unstable_by_key(|part| part.1.id);

    // TODO: Find better way (without using HashSet)
    let of_parts_filter: HashSet<i32> = HashSet::from_iter(of_parts.iter().map(|(_, id)| *id));

    for i in 0..TOTAL_OF_NUM {
        if of_parts_filter.contains(&(i as i32)) {
            response.push(1);
        } else {
            response.push(0);
        }
    }

    // (id, len)
    let led_parts: BTreeMap<i32, u8> =
        BTreeMap::from_iter(led_parts.iter().map(|(_, part)| (part.id, part.len as u8)));

    for i in 0..TOTAL_STRIP_NUM {
        response.push(*led_parts.get(&(i as i32)).unwrap_or(&0));
    }

    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();

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
            ORDER BY ControlFrame.start ASC
        "#,
        dancer
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?
    .into_iter()
    .collect_vec();

    let frame_start_times: BTreeSet<i32> =
        BTreeSet::from_iter(frame_data.into_iter().map(|data| data.control_frame_start));

    response.push(
        frame_start_times
            .len()
            .try_into()
            .map_err(|_| {
                format!(
                    "The number of frames {} is not valid",
                    frame_start_times.len()
                )
            })
            .into_result()?,
    );

    frame_start_times.iter().for_each(|f| {
        write_little_endian(&(*f as u32), &mut response);
    });

    let mut headers = HeaderMap::new();
    headers.insert(
        "content-type",
        HeaderValue::from_static("application/octect-stream"),
    );

    let response_bytes = Bytes::from(response);

    Ok((StatusCode::OK, (headers, response_bytes)))
}

pub async fn test_control_dat(
) -> Result<(StatusCode, (HeaderMap, Bytes)), (StatusCode, Json<GetDataFailedResponse>)> {
    let dancer = "2_feng".to_string();
    let of_parts = HashMap::new();
    let mut led_parts: HashMap<String, LEDPart> = HashMap::new();
    led_parts.insert("mask_LED".to_string(), LEDPart { id: 0, len: 28 });

    control_dat(Json::from(GetControlDatQuery {
        dancer,
        of_parts,
        led_parts,
    }))
    .await
}
