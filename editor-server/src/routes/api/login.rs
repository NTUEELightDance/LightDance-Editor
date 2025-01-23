use crate::db::types::user::UserData;
use crate::global;
use crate::utils::authentication;

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
    // Check env type
    let env_type = &global::envs::get().env;

    if env_type == "development" {
        // Set cookie
        let token = "testToken";
        let http_only = true;

        let mut header = HeaderMap::new();
        header.insert(
            "Set-Cookie",
            format!("token={token}; HttpOnly={http_only}; Path=/")
                .parse()
                .unwrap(),
        );

        let login_response = LoginResponse {
            token: "testToken".to_string(),
        };

        Ok((StatusCode::OK, (header, Json(login_response))))
    } else {
        // // Check query
        // let query = match query {
        //     Some(query) => query.0,
        //     None => {
        //         return Err((
        //             StatusCode::BAD_REQUEST,
        //             Json(LoginFailedResponse {
        //                 err: "No query.".to_string(),
        //             }),
        //         ))
        //     }
        // };

        // Get app state
        let clients = global::clients::get();

        // Query user
        let mysql_pool = clients.mysql_pool();
        let user = sqlx::query_as!(
            UserData,
            r#"
                SELECT * FROM User WHERE name = ? LIMIT 1;
            "#,
            query.username
        )
        .fetch_one(mysql_pool)
        .await
        .map_err(|_| {
            (
                StatusCode::NOT_FOUND,
                Json(LoginFailedResponse {
                    err: "User not found.".to_string(),
                }),
            )
        })?;

        if !authentication::compare_password(&query.password, &user.password) {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(LoginFailedResponse {
                    err: "Password incorrect.".to_string(),
                }),
            ));
        }

        // Get expiration time from env
        let expiration_time_hours: u64 = match var("TOKEN_EXPIRATION_TIME_HOURS") {
            Ok(expiration_time_hours) => expiration_time_hours.parse::<u64>().unwrap(),
            Err(_) => 24,
        };
        let expiration_time_seconds: u64 = expiration_time_hours * 60 * 60;

        // Generate token and store it in redis
        let redis_client = clients.redis_client();
        let mut conn = redis_client
            .get_multiplexed_async_connection()
            .await
            .unwrap();

        let token = authentication::generate_csrf_token();
        let _: Result<(), _> = conn.set_ex(&token, user.id, expiration_time_seconds).await;
        let _: Result<(), _> = conn.set_ex(user.id, &token, expiration_time_seconds).await;

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
