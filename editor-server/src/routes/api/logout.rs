use axum::{http::StatusCode, response::Json};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct LogoutResponse {
    success: bool,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LogoutFailedResponse {
    err: String,
}

/// Logout handler.
/// Remove token from redis and return success message.
/// Otherwise return an error message.
pub async fn logout(
    cookie_jar: CookieJar,
) -> Result<(StatusCode, Json<LogoutResponse>), (StatusCode, Json<LogoutFailedResponse>)> {
    let _ = match cookie_jar.get("token") {
        Some(token) => token.value().to_string(),
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(LogoutFailedResponse {
                    err: "Token is required.".to_string(),
                }),
            ))
        }
    };

    let _ = cookie_jar.remove("token");

    Ok((StatusCode::OK, Json(LogoutResponse { success: true })))
}
