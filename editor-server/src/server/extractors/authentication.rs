//! Authentication middleware.
//! Authenticate user by token stored in cookie and pass a user context to the handler.

use crate::global;
use crate::types::global::UserContext;
use crate::utils::authentication::{get_test_user_context, verify_token};

use axum::{extract::FromRequestParts, http::request::Parts};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};
use std::env::var;
use std::fmt::Debug;

/// Authenticate user by token stored in cookie.
/// Then pass a user context to the handler.
#[derive(Debug)]
pub struct Authentication(pub UserContext);

#[derive(Debug, Deserialize, Serialize)]
struct Token(String);

// impl Authentication {
//     pub async fn get_test_user() -> Result<UserContext, &'static str> {
//         dotenv::dotenv().ok();
//
//         let clients = global::clients::get();
//
//         let username = var("AUTH0_TEST_USERNAME").expect("test username not set");
//         let password = var("AUTH0_TEST_PASSWORD").expect("test password not set");
//
//         let token = get_token(username, password)
//             .await
//             .map_err(|_| "error getting token for test user")?;
//
//         let test_user = get_user_metadata(token.as_str())
//             .await
//             .map_err(|_| "error getting user metadata")?;
//
//         let test_user_data: UserMetadata =
//             serde_json::from_str(test_user.as_str()).map_err(|_| "error parsing test user data")?;
//
//         Ok(UserContext {
//             user_id: test_user_data.id,
//             username: test_user_data.name,
//             clients,
//         })
//     }
// }

impl FromRequestParts<()> for Authentication {
    type Rejection = &'static str;

    async fn from_request_parts(_parts: &mut Parts, _state: &()) -> Result<Self, Self::Rejection> {
        if var("ENV").expect("ENV not set") == "development" {
            let test_user_context = get_test_user_context()
                .await
                .map_err(|_| "error getting test user context")?;

            Ok(Authentication(test_user_context))
        } else {
            // Load cookie jar for fetching token
            let cookie_jar = CookieJar::from_request_parts(_parts, &()).await;
            let cookie_jar = match cookie_jar {
                Ok(cookie_jar) => cookie_jar,
                Err(_) => return Err("No cookie jar."),
            };

            let token = match cookie_jar.get("token") {
                Some(token) => token.value().to_string(),
                None => return Err("No token."),
            };

            // Verify token
            let user = verify_token(&token).await.map_err(|_| "user not found")?;

            let clients = global::clients::get();

            // TODO: set editing
            Ok(Authentication(UserContext {
                username: user.name,
                user_id: user.id,
                clients,
            }))
        }
    }
}
