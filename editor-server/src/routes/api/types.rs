use crate::routes::api::utils::IntoResult;
use axum::{http::StatusCode, Json};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize)]
pub struct LEDPart {
    pub id: i32,
    pub len: i32,
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

#[derive(Debug, Deserialize, Serialize)]
pub struct UploadDataResponse(pub String);

#[derive(Debug, Deserialize, Serialize)]
pub struct UploadDataFailedResponse {
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

impl<R, E> IntoResult<R, (StatusCode, Json<UploadDataFailedResponse>)> for Result<R, E>
where
    E: std::string::ToString,
{
    fn into_result(self) -> Result<R, (StatusCode, Json<UploadDataFailedResponse>)> {
        match self {
            Ok(ok) => Ok(ok),
            Err(err) => Err((
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(UploadDataFailedResponse {
                    err: err.to_string(),
                }),
            )),
        }
    }
}
