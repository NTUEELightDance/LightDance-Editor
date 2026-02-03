use axum::{http::StatusCode, response::Json};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use super::utils::IntoResult;

#[derive(Debug, Deserialize, Serialize)]
pub struct LEDPart {
    pub id: i32,
    pub len: i32,
}

impl LEDPart {
    pub fn get_len(&self) -> i32 {
        self.len
    }

    pub fn get_id(&self) -> i32 {
        self.id
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetControlDatQuery {
    pub dancer: String,
    #[serde(rename = "OFPARTS")]
    pub of_parts: HashMap<String, i32>,
    #[serde(rename = "LEDPARTS")]
    pub led_parts: HashMap<String, LEDPart>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GetDataFailedResponse {
    pub err: String,
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
