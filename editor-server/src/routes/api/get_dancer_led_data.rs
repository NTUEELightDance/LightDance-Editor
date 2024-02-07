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
    status: Vec<[i32; 4]>,
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

    // get parts and control data of parts for dancer
    let dancer_data = sqlx::query!(
        r#"
            SELECT
                Dancer.name,
                Dancer.id,
                Part.name as "part_name",
                Part.id as "part_id",
                Part.length as "part_length",
                ControlData.effect_id
            FROM Dancer
            INNER JOIN Model
                ON Dancer.model_id = Model.id
            INNER JOIN Part
                ON Model.id = Part.model_id
            INNER JOIN ControlData
                ON Part.id = ControlData.part_id AND
                ControlData.dancer_id = Dancer.id
            WHERE Dancer.name = ? AND Part.type = 'LED'
        "#,
        dancer
    )
    .fetch_all(mysql_pool)
    .await
    .into_result()?;

    if dancer_data.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(GetDataFailedResponse {
                err: "Dancer not found.".to_string(),
            }),
        ));
    }

    let mut parts: HashMap<String, Vec<Part>> = HashMap::new();

    // organize control data into their respective parts
    for data in dancer_data.into_iter() {
        parts.entry(data.name).or_default().push(Part {
            length: data.part_length,
            effect_id: data.effect_id,
        });
    }

    let mut response: GetDataResponse = HashMap::new();

    for (part_name, control_data) in parts.iter() {
        let mut part_data = vec![[0, 0, 0, 0]; control_data[0].length.unwrap() as usize];

        for data in control_data.iter() {
            // -1 means no effect (for now)
            if data.effect_id.ok_or("Effect id not found").into_result()? == -1 {
                continue;
            }

            // find effect states for effect of given control data and part
            let led_effect_states = sqlx::query!(
                r#"
                    SELECT
                        LEDEffectState.color_id,
                        LEDEffectState.alpha,
                        LEDEffectState.position
                    FROM LEDEffect
                    INNER JOIN LEDEffectState ON LEDEffect.id = LEDEffectState.effect_id
                    WHERE part_id = ? AND LEDEffect.id = ?
                "#,
                part_name,
                data.effect_id.ok_or("Effect id not found").into_result()?
            )
            .fetch_all(mysql_pool)
            .await
            .into_result()?;

            // transfrom color id to rgb values for each position
            for state in led_effect_states.iter() {
                let color = color_map
                    .get(&state.color_id)
                    .unwrap_or(&Color { r: 0, g: 0, b: 0 });
                part_data[state.position as usize] = [color.r, color.g, color.b, state.alpha];
            }
        }

        response.insert(part_name.clone(), Status { status: part_data });
    }

    let mut headers = HeaderMap::new();
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    // return data of form {part_name: {status: [[r, g, b, a], [r, g, b, a]]}, ...}
    // index of status array is position of led

    Ok((StatusCode::OK, (HeaderMap::new(), Json(response))))
}
