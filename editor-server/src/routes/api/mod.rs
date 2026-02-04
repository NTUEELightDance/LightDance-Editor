//! REST API routes.

mod check_token;
mod control_dat;
mod export_data;
mod frame_dat;
mod login;
mod logout;
mod ping;
mod test_frame_dat;
mod types;
mod upload_data;
mod utils;

use axum::{
    extract::DefaultBodyLimit,
    routing::{get, post},
    Router,
};

/// Build REST API routes for Axum server.
pub fn build_api_routes() -> Router {
    Router::new()
        .route("/checkToken", get(check_token::check_token))
        .route("/ping", get(ping::ping))
        .route("/login", post(login::login))
        .route("/logout", post(logout::logout))
        .route("/controlDat", post(control_dat::control_dat))
        .route("/frameDat", post(frame_dat::frame_dat))
        .route("/exportData", get(export_data::export_data))
        .route("/uploadData", post(upload_data::upload_data))
        .route("/testFrameDat", get(test_frame_dat::test_frame_dat))
        .layer(DefaultBodyLimit::max(256 * 1024 * 1024))
}
