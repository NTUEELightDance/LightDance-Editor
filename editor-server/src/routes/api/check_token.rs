use crate::utils::authentication::verify_token;

use axum::{http::StatusCode, response::Json};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CheckTokenResponse {
    token: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CheckTokenFailedResponse {
    err: String,
}

/// check token endpoint
/// get token from cookie and check its validity
pub async fn check_token(
    cookie_jar: CookieJar,
) -> Result<(StatusCode, Json<CheckTokenResponse>), (StatusCode, Json<CheckTokenFailedResponse>)> {
    // get token from cookieJar
    let token = cookie_jar
        .get("token")
        .map(|cookie| cookie.value().to_string())
        .ok_or_else(|| {
            (
                StatusCode::BAD_REQUEST,
                Json(CheckTokenFailedResponse {
                    err: "Token is required.".to_string(),
                }),
            )
        })?;

    let user = verify_token(token.as_str()).await;

    match user {
        Ok(_) => Ok((StatusCode::OK, Json(CheckTokenResponse { token }))),
        Err(_) => Err((
            StatusCode::NOT_FOUND,
            Json(CheckTokenFailedResponse {
                err: "user not found".to_string(),
            }),
        )),
    }
}
