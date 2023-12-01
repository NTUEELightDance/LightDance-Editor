use axum::response::IntoResponse;

/// Login handler.
pub async fn login() -> impl IntoResponse {
    "login"
}
