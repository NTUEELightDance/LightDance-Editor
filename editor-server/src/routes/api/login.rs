use crate::global;

use axum::{http::HeaderMap, http::StatusCode, response::Json};
use reqwest;
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

#[derive(Debug, Deserialize)]
struct Auth0LoginRes {
    access_token: String,
    // id_token: String,
    // scope: String,
    // expires_in: i32,
    // token_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Auth0LoginReq {
    grant_type: String,
    username: String,
    password: String,
    audience: String,
    scope: String,
    client_id: String,
    client_secret: String,
}

/// Login handler.
/// Return a token in cookie if login is successful.
/// Otherwise return an error message.
#[allow(unused)]
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
        dotenv::dotenv().ok();

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

        // login specs
        let username = query.username.clone();
        let password = query.password.clone();
        let auth0_domain = var("AUTH0_DOMAIN").expect("domain not set");
        let auth0_client_id = var("AUTH0_CLIENT_ID").expect("id not set");
        let auth0_client_secret = var("AUTH0_CLIENT_SECRET").expect("secret not set");
        let url = format!("https://{auth0_domain}/oauth/token");

        let params = Auth0LoginReq {
            grant_type: "password".to_string(),
            username,
            password,
            audience: "https://test/".to_string(),
            scope: "openid profile email".to_string(),
            client_id: auth0_client_id.to_string(),
            client_secret: auth0_client_secret.to_string(),
        };

        // get response from Auth0

        let client = reqwest::Client::new();
        let res = client.post(url).form(&params).send().await;

        let res = match res {
            Ok(res) => res,
            Err(err) => {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(LoginFailedResponse {
                        err: err.to_string(),
                    }),
                ));
            }
        };

        if res.status() != reqwest::StatusCode::OK {
            return Err((
                http::StatusCode::from_u16(res.status().as_u16()).expect("invalid status code"),
                Json(LoginFailedResponse {
                    err: "auth0 authentication error".to_string(),
                }),
            ));
        }

        // Get app state
        let clients = global::clients::get();

        // Get expiration time from env
        let expiration_time_hours: u64 = match var("TOKEN_EXPIRATION_TIME_HOURS") {
            Ok(expiration_time_hours) => expiration_time_hours.parse::<u64>().unwrap(),
            Err(_) => 24,
        };
        let expiration_time_seconds: u64 = expiration_time_hours * 60 * 60;

        // get token from Auth0 response
        let token = res.json::<Auth0LoginRes>().await.unwrap().access_token;

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
