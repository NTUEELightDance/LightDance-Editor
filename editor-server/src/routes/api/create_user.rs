use crate::global;
use crate::utils::authentication::{create_user as create_user_util, verify_admin_token};

use axum::{http::StatusCode, response::Json};
use axum_extra::extract::CookieJar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserQuery {
    username: String,
    password: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserResponse(String);

#[derive(Debug, Deserialize, Serialize)]
pub struct CreateUserFailedResponse {
    err: String,
}

/// CreateUser handler.
/// Verify admin previlige and create a user.
pub async fn create_user(
    cookie_jar: CookieJar,
    query: Json<CreateUserQuery>,
) -> Result<(StatusCode, Json<CreateUserResponse>), (StatusCode, Json<CreateUserFailedResponse>)> {
    // Get token from cookie jar
    // let cookie_jar = match cookie_jar {
    //     Some(cookie_jar) => cookie_jar,
    //     None => {
    //         return Err((
    //             StatusCode::INTERNAL_SERVER_ERROR,
    //             Json(CreateUserFailedResponse {
    //                 err: "Failed to retrieve cookies.".to_string(),
    //             }),
    //         ))
    //     }
    // };

    let token = match cookie_jar.get("token") {
        Some(token) => token.value().to_string(),
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(CreateUserFailedResponse {
                    err: "Token is required.".to_string(),
                }),
            ))
        }
    };

    // Check query
    // let query = match query {
    //     Some(query) => query.0,
    //     None => {
    //         return Err((
    //             StatusCode::BAD_REQUEST,
    //             Json(CreateUserFailedResponse {
    //                 err: "No query.".to_string(),
    //             }),
    //         ))
    //     }
    // };

    let clients = global::clients::get();

    // Check if user is admin
    verify_admin_token(clients, &token).await.map_err(|err| {
        (
            StatusCode::UNAUTHORIZED,
            Json(CreateUserFailedResponse { err }),
        )
    })?;

    // Create user
    create_user_util(clients, &query.username, &query.password)
        .await
        .map_err(|err| {
            (
                StatusCode::BAD_REQUEST,
                Json(CreateUserFailedResponse { err }),
            )
        })?;

    Ok((
        StatusCode::OK,
        Json(CreateUserResponse(format!(
            "Successfully created user {}.",
            query.username
        ))),
    ))
}
