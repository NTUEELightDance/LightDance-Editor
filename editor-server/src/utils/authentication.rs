//! Authencation functions.

use crate::db::types::user::UserData;

use serde::Deserialize;
use std::env::var;

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
