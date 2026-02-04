use axum::{
    http::{HeaderMap, HeaderValue, StatusCode},
    response::Json,
};

use super::types::{GetControlDatQuery, GetDataFailedResponse};
use super::utils::{write_little_endian, IntoResult};
use itertools::Itertools;

use crate::global::{self, channel_table::ChannelTable};

type GetDataResponse = Vec<u8>;

const VERSION: [u8; 2] = [0, 0];

pub async fn control_dat(
    query: Json<GetControlDatQuery>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
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
    let mut led_parts = Vec::from_iter(led_parts.into_iter());

    ChannelTable::init();

    // TODO: find cleaner way for this
    of_parts.sort_unstable_by_key(|part| ChannelTable::get_part_id(&part.0).unwrap_or(-1));
    led_parts.sort_unstable_by_key(|part| ChannelTable::get_part_id(&part.0).unwrap_or(-1));

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
        response.push(part.get_len() as u8);
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
            ORDER BY ControlFrame.start ASC
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
