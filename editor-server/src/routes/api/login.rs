use crate::global;
use crate::utils::authentication::{get_token, get_user_metadata, init_test_user};
use axum::{http::HeaderMap, http::StatusCode, response::Json};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::env::var;

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginQuery {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginResponse {
    token: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginFailedResponse {
    err: String,
}

/// Login handler.
/// Return a token in cookie if login is successful.
/// Otherwise return an error message.
pub async fn login(
    query: Json<LoginQuery>,
) -> Result<(StatusCode, (HeaderMap, Json<LoginResponse>)), (StatusCode, Json<LoginFailedResponse>)>
{
    dotenv::dotenv().ok();

    let env_type = &global::envs::get().env;

    if env_type == "development" {
        init_test_user()
            .await
            .map_err(|err| (StatusCode::IM_A_TEAPOT, Json(LoginFailedResponse { err })))?;

        let token = var("AUTH0_TEST_TOKEN").expect("test token not set");
        let http_only = true;

        let mut header = HeaderMap::new();
        header.insert(
            "Set-Cookie",
            format!("token={token}; HttpOnly={http_only}; Path=/")
                .parse()
                .unwrap(),
        );

        let login_response = LoginResponse { token };

        Ok((StatusCode::OK, (header, Json(login_response))))
    } else {
        let username = query.username.clone();
        let password = query.password.clone();

        // get token
        let token = get_token(username, password)
            .await
            .map_err(|err| (err.0, Json(LoginFailedResponse { err: err.1 })))?;

        // get user info
        let user_metadata = get_user_metadata(token.as_str())
            .await
            .map_err(|err| (StatusCode::NOT_FOUND, Json(LoginFailedResponse { err })))?;

        // Get expiration time from env
        let expiration_time_hours: u64 = match var("TOKEN_EXPIRATION_TIME_HOURS") {
            Ok(expiration_time_hours) => expiration_time_hours.parse::<u64>().unwrap(),
            Err(_) => 24,
        };
        let expiration_time_seconds: u64 = expiration_time_hours * 60 * 60;

        // store token and user info in redis
        let clients = global::clients::get();
        let redis_client = clients.redis_client();
        let mut redis_connection = redis_client
            .get_multiplexed_async_connection()
            .await
            .map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(LoginFailedResponse {
                        err: "error getting redis connection".to_string(),
                    }),
                )
            })?;

        let _: () = redis_connection
            .set_ex(token.as_str(), user_metadata, expiration_time_seconds)
            .await
            .map_err(|_| {
                (
                    StatusCode::BAD_REQUEST,
                    Json(LoginFailedResponse {
                        err: "error storing token in redis".to_string(),
                    }),
                )
            })?;

        // Set cookie
        let http_only = true;
        let max_age = expiration_time_seconds;

        let mut header = HeaderMap::new();
        header.insert(
            "Set-Cookie",
            format!("token={token}; HttpOnly={http_only}; Max-Age={max_age}; Path=/")
                .parse()
                .unwrap(),
        );

        let login_response = LoginResponse { token };

        Ok((StatusCode::OK, (header, Json(login_response))))
    }
}
