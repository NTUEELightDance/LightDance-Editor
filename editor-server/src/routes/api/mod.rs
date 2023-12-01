mod login;

use self::login::login;

use axum::{routing::get, Router};

pub fn build_api_routes() -> Router {
    Router::new().route("/login", get(login))
}
