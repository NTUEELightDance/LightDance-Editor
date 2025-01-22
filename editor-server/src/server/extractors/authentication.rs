//! Authentication middleware.
//! Authenticate user by token stored in cookie and pass a user context to the handler.

use crate::db::types::user::UserData;
use crate::global;
use crate::types::global::UserContext;

use axum::{extract::FromRequestParts, http::request::Parts};
use axum_extra::extract::CookieJar;
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::env::var;
use std::fmt::Debug;

/// Authencate user by token stored in cookie.
/// Then pass a user context to the handler.
#[derive(Debug)]
pub struct Authentication(pub UserContext);

#[derive(Debug, Deserialize, Serialize)]
struct Token(String);


impl FromRequestParts<()> for Authentication {
    type Rejection = &'static str;

    async fn from_request_parts(_parts: &mut Parts, _state: &()) -> Result<Self, Self::Rejection> {
        if var("ENV").map_err(|_| "ENV not set")? == "development" {
            let clients = global::clients::get();
            let mysql_pool = clients.mysql_pool();

            let test_user = sqlx::query_as!(
                UserData,
                r#"
                    SELECT * FROM User ORDER BY id LIMIT 1;
                "#,
            )
            .fetch_one(mysql_pool)
            .await;

            if let Ok(test_user) = test_user {
                return Ok(Authentication(UserContext {
                    username: test_user.name,
                    user_id: test_user.id,
                    clients,
                }));
            } else {
                return Err("No test user found.");
            }
        } else {
            // Load cookie jar for fetching token
            let cookie_jar = CookieJar::from_request_parts(_parts, &()).await;
            let cookie_jar = match cookie_jar {
                Ok(cookie_jar) => cookie_jar,
                Err(_) => return Err("No cookie jar."),
            };

            #[allow(unused)]
            let token = match cookie_jar.get("token") {
                Some(token) => token.value().to_string(),
                None => return Err("No token."),
            };

            let clients = global::clients::get();

            // Verify token
            let redis_client = clients.redis_client();
            let mut redis_conn = redis_client
                .get_async_connection()
                .await
                .map_err(|_| "Failed to get redis connection.")?;

            let id: u32 = redis_conn
                .get(&token)
                .await
                .map_err(|_| "Token is unauthorized.")?;

            // Verify user id
            let mysql_pool = clients.mysql_pool();
            let user = sqlx::query_as!(
                UserData,
                r#"
                    SELECT * FROM User WHERE id = ?;
                "#,
                id,
            )
            .fetch_one(mysql_pool)
            .await
            .map_err(|_| "User not found.")?;

            // TODO: set editing
            Ok(Authentication(UserContext {
                username: user.name,
                user_id: user.id,
                clients,
            }))
        }
    }
}
