//! REST API routes.

mod check_token;
mod create_user;
mod delete_user;
mod export_data;
mod export_logger;
mod get_dancer_fiber_data;
mod get_dancer_led_data;
mod login;
mod logout;
mod upload_data;

use axum::{routing::post, Router};

/// Build REST API routes for Axum server.
pub fn build_api_routes() -> Router {
    Router::new()
        // .route("/checkToken", get(check_token::check_token))
        .route("/login", post(login::login))
        .route("/logout", post(logout::logout))
        .route("/createUser", post(create_user::create_user))
}
