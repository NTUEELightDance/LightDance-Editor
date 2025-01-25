//! Authencation functions.

use crate::db::clients::AppClients;
use crate::db::types::user::UserData;
use crate::global;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
// use bcrypt;
#[allow(unused_imports)]
use redis::AsyncCommands;
use serde::Deserialize;
use std::env::var;
use uuid::Uuid;

// const HASH_ROUNDS: u32 = 8;

/// Generate a random string for CSRF token.
pub fn generate_csrf_token() -> String {
    Uuid::new_v4().to_string()
}

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

/// Hash password with argon2.
pub fn hash_password(password: &str) -> Result<String, String> {
    // bcrypt::hash(password, HASH_ROUNDS).map_err(|_| "Error hashing password.".into())
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|_| "Error hashing password.")?;

    Ok(password_hash.to_string())
}

/// Compare password with hashed password.
pub fn compare_password(password: &str, hashed_password: &str) -> bool {
    // bcrypt::verify(password, hashed_password).unwrap_or(false)
    let argon2 = Argon2::default();
    let password_hash = PasswordHash::new(hashed_password).unwrap();
    argon2
        .verify_password(password.as_bytes(), &password_hash)
        .is_ok()
}

/// Authenticate user by token stored in cookie.
/// Then return the user data.
#[allow(unused_variables)]
pub async fn verify_token(clients: &AppClients, token: &str) -> Result<UserData, String> {
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

    // Get token from redis
    // let redis_client = clients.redis_client();
    // let mut redis_conn = redis_client
    //     .get_async_connection()
    //     .await
    //     .map_err(|_| "Error getting redis connection.")?;
    //
    // let user_id: u32 = redis_conn
    //     .get(token)
    //     .await
    //     .map_err(|_| "Error getting token.")?;
    //
    // // Get user from mysql
    // // TODO: This part can be removed if we add deleteUser route
    // // When user is deleted, the token will be deleted from redis
    // let mysql_pool = clients.mysql_pool();
    //
    // let user = sqlx::query_as!(
    //     UserData,
    //     r#"
    //         SELECT * FROM User WHERE id = ? LIMIT 1;
    //     "#,
    //     user_id,
    // )
    // .fetch_one(mysql_pool)
    // .await
    // .map_err(|_| "Error getting user.")?;

    // Ok(user)
}

/// Verify if the user token is admin.
pub async fn verify_admin_token(clients: &AppClients, token: &str) -> Result<(), String> {
    let user = verify_token(clients, token).await?;

    if user.name != var("ADMIN_USERNAME").expect("ADMIN_USERNAME is not set") {
        return Err("Unauthorized.".into());
    }

    Ok(())
}

/// Create user with username and password.
/// If user already exists, update password.
pub async fn create_user(
    clients: &AppClients,
    username: &str,
    password: &str,
) -> Result<(), String> {
    if username.is_empty() || password.is_empty() {
        return Err("Username and password are required.".into());
    }

    if username.contains(' ') {
        return Err("Username cannot contain spaces.".into());
    }

    if username.len() > 30 {
        return Err("Username cannot be longer than 30 characters.".into());
    }

    if password.len() > 100 {
        return Err("Password cannot be longer than 100 characters.".into());
    }

    let admin_username = var("ADMIN_USERNAME").expect("ADMIN_USERNAME is not set");
    if username == admin_username {
        return Err("Admin user already exists.".into());
    }

    let mysql_pool = clients.mysql_pool();

    let user = sqlx::query_as!(
        UserData,
        r#"
            SELECT * FROM User WHERE name = ? LIMIT 1;
        "#,
        username,
    )
    .fetch_one(mysql_pool)
    .await;

    let hashed_password = hash_password(password)?;

    // TODO: Link frame id?
    if let Ok(user) = user {
        let _ = sqlx::query!(
            r#"
                UPDATE User SET password = ? WHERE id = ?;
            "#,
            hashed_password,
            user.id,
        )
        .execute(mysql_pool)
        .await
        .map_err(|_| "Error updating user.")?;
    } else {
        let _ = sqlx::query!(
            r#"
                INSERT INTO User (name, password) VALUES (?, ?);
            "#,
            username,
            hashed_password,
        )
        .execute(mysql_pool)
        .await
        .map_err(|_| "Error creating user.")?;
    }

    Ok(())
}

/// Create admin user with username and password.
/// If user already exists, update password.
pub async fn create_admin_user() -> Result<(), String> {
    let admin_username = var("ADMIN_USERNAME").expect("ADMIN_USERNAME is not set");
    let admin_password = var("ADMIN_PASSWORD").expect("ADMIN_PASSWORD is not set");

    let app_state = global::clients::get();
    let mysql_pool = app_state.mysql_pool();

    // Delete existing admin user
    sqlx::query!(
        r#"
            DELETE FROM User WHERE name = ?;
        "#,
        admin_username,
    )
    .execute(mysql_pool)
    .await
    .map_err(|_| "Error deleting admin user.")?;

    let hashed_password = hash_password(&admin_password)?;

    // TODO: Link frame id?
    sqlx::query!(
        r#"
            INSERT INTO User (name, password) VALUES (?, ?);
        "#,
        admin_username,
        hashed_password,
    )
    .execute(mysql_pool)
    .await
    .map_err(|_| "Error creating admin user.")?;

    Ok(())
}
