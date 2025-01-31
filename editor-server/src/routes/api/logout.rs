use crate::global;
use axum::{http::StatusCode, response::Json};
use axum_extra::extract::CookieJar;
use redis::AsyncCommands;
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
    let token = match cookie_jar.get("token") {
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

    // remove token from redis
    let clients = global::clients::get();
    let redis_client = clients.redis_client();
    let mut redis_connection = redis_client
        .get_multiplexed_async_connection()
        .await
        .map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                Json(LogoutFailedResponse {
                    err: "error getting redis connection".to_string(),
                }),
            )
        })?;

    let _: () = redis_connection.del(token.as_str()).await.map_err(|_| {
        (
            StatusCode::BAD_REQUEST,
            Json(LogoutFailedResponse {
                err: "error deleting token from redis".to_string(),
            }),
        )
    })?;

    Ok((StatusCode::OK, Json(LogoutResponse { success: true })))
}
