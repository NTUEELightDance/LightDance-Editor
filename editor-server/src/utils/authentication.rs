//! Authencation functions.

use crate::db::types::user::UserData;

use axum::http::StatusCode;
use serde::{Deserialize, Serialize};
use std::env::var;

use dotenv;

// custom type for user data from auth0
#[derive(Debug, Deserialize)]
struct UserMetadata {
    id: i32,
    name: String,
    password: String,
}

#[derive(Debug, Deserialize)]
struct UserInfo {
    #[serde(rename = "https://foo.com/mtdt")]
    metadata: UserMetadata,
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

/// Authenticate user by token stored in cookie.
/// Then return the user data.
pub async fn verify_token(token: &str) -> Result<UserData, String> {
    dotenv::dotenv().ok();

    // specs
    let auth0_domain = var("AUTH0_DOMAIN").expect("domain not set");
    let url = format!("https://{auth0_domain}/userinfo");

    // get response from Auth0
    let client = reqwest::Client::new();
    let res = client
        .get(url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|_| "Error retrieving user info")?;

    let res_data = res
        .json::<UserInfo>()
        .await
        .map_err(|_| "Error getting metadata")?;

    let user_metadata = res_data.metadata;

    Ok(UserData {
        id: user_metadata.id,
        name: user_metadata.name,
        password: user_metadata.password,
    })
}

pub async fn get_token(username: String, password: String) -> Result<String, (StatusCode, String)> {
    // login specs
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

    let client = reqwest::Client::new();
    let res = client.post(url).form(&params).send().await;

    let res = match res {
        Ok(res) => res,
        Err(err) => {
            return Err((StatusCode::BAD_REQUEST, err.to_string()));
        }
    };

    if res.status() != reqwest::StatusCode::OK {
        return Err((
            StatusCode::from_u16(res.status().as_u16()).expect("invalid status code"),
            "Auth0 authentication error".to_string(),
        ));
    }

    let token = res
        .json::<Auth0LoginRes>()
        .await
        .map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                "error getting token from Auth0 response".to_string(),
            )
        })?
        .access_token;

    Ok(token)
}
