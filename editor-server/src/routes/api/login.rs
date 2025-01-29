use crate::utils::authentication::get_token;
use axum::{http::HeaderMap, http::StatusCode, response::Json};
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

    let username = query.username.clone();
    let password = query.password.clone();

    // get token
    let token = get_token(username, password)
        .await
        .map_err(|err| (err.0, Json(LoginFailedResponse { err: err.1 })))?;

    // Get expiration time from env
    let expiration_time_hours: u64 = match var("TOKEN_EXPIRATION_TIME_HOURS") {
        Ok(expiration_time_hours) => expiration_time_hours.parse::<u64>().unwrap(),
        Err(_) => 24,
    };
    let expiration_time_seconds: u64 = expiration_time_hours * 60 * 60;

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
