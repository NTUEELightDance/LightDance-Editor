use crate::global;
use axum::{
    extract::Query,
    headers::{HeaderMap, HeaderValue},
    http::StatusCode,
    response::Json,
};
use http::header::CONTENT_TYPE;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct Status {
    status: Vec<Vec<i32>>,
}

pub type GetDataResponse = HashMap<String, Status>;

#[derive(Debug, Deserialize, Serialize)]
pub struct GetDataFailedResponse {
    err: String,
}

#[derive(Debug)]
struct Part {
    length: Option<i32>,
    effect_id: Option<i32>,
}

#[derive(Debug)]
struct Color {
    r: i32,
    g: i32,
    b: i32,
}

pub async fn get_dancer_led_data(
    Query(query): Query<HashMap<String, String>>,
) -> Result<
    (StatusCode, (HeaderMap, Json<GetDataResponse>)),
    (StatusCode, Json<GetDataFailedResponse>),
> {
    let dancer = match query.get("dancer") {
        Some(dancer) => dancer,
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(GetDataFailedResponse {
                    err: "Dancer name is required.".to_string(),
                }),
            ))
        }
    };

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
    .unwrap();

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

    let dancer_data = sqlx::query!(
        r#"
            SELECT Part.name, Part.length, ControlData.effect_id
            FROM Dancer
            INNER JOIN Part ON Dancer.id = Part.dancer_id
            INNER JOIN ControlData ON Part.id = ControlData.part_id
            WHERE Dancer.name = ? AND Part.type = 'LED'
            "#,
        dancer
    )
    .fetch_all(mysql_pool)
    .await
    .unwrap();

    if dancer_data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(GetDataFailedResponse {
                err: "Dancer not found.".to_string(),
            }),
        ));
    }

    let mut parts: HashMap<String, Vec<Part>> = HashMap::new();

    for data in dancer_data.iter() {
        parts
            .entry(data.name.clone())
            .or_insert_with(Vec::new)
            .push(Part {
                effect_id: data.effect_id,
                length: data.length,
            });
    }

    let mut response: GetDataResponse = HashMap::new();

    for (part_name, control_data) in parts.iter() {
        let mut part_data = vec![vec![0, 0, 0, 0]; control_data[0].length.unwrap() as usize];

        for data in control_data.iter() {
            if data.effect_id.unwrap() == -1 {
                continue;
            }

            let led_effect_states = sqlx::query!(
                r#"
                    SELECT LEDEffectState.color_id, LEDEffectState.alpha, LEDEffectState.position
                    FROM LEDEffect
                    INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id  
                    WHERE part_name = ? AND LEDEffect.id = ?
                    "#,
                part_name,
                data.effect_id.unwrap()
            )
            .fetch_all(mysql_pool)
            .await
            .unwrap();

            for state in led_effect_states.iter() {
                if state.color_id == 0 {
                    part_data[state.position as usize] = vec![0, 0, 0, state.alpha];
                } else {
                    let color = color_map.get(&state.color_id).unwrap();

                    part_data[state.position as usize] =
                        vec![color.r, color.g, color.b, state.alpha];
                }
            }
        }

        response.insert(part_name.clone(), Status { status: part_data });
    }

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    Ok((StatusCode::OK, (HeaderMap::new(), Json(response))))
}
