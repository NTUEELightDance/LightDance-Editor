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
    // Get token from cookie jar
    // let cookie_jar = match cookie_jar {
    //     Some(cookie_jar) => cookie_jar,
    //     None => {
    //         return Err((
    //             StatusCode::INTERNAL_SERVER_ERROR,
    //             Json(LogoutFailedResponse {
    //                 err: "Failed to retrieve cookies.".to_string(),
    //             }),
    //         ))
    //     }
    // };

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

    // // Get app state
    // let clients = global::clients::get();
    //
    // // Generate token and store it in redis
    // let redis_client = clients.redis_client();
    // let mut conn = redis_client
    //     .get_multiplexed_async_connection()
    //     .await
    //     .unwrap();
    //
    // let id: String = conn.get(&token).await.map_err(|_| {
    //     (
    //         StatusCode::UNAUTHORIZED,
    //         Json(LogoutFailedResponse {
    //             err: "Unauthorized.".to_string(),
    //         }),
    //     )
    // })?;
    //
    // let _: Result<(), _> = conn.del(&id).await;
    // let _: Result<(), _> = conn.del(&token).await;

    // remove token form cokoie jar
    let _ = cookie_jar.remove("token");

    Ok((StatusCode::OK, Json(LogoutResponse { success: true })))
}
