//! REST API routes.

mod login;

use self::login::login;

use axum::{routing::get, Router};

/// Build REST API routes for Axum server.
pub fn build_api_routes() -> Router {
    Router::new().route("/login", get(login))
}
