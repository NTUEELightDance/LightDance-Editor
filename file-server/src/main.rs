use axum::Router;
use dotenv::dotenv;
use std::env::var;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let port = var("PORT").unwrap_or_else(|_| "8081".to_string());

    let assets_path = "../files/asset";
    let data_path = "../files/data";
    let music_path = "../files/music";

    let app = Router::new()
        .nest_service("/music", ServeDir::new(music_path))
        .nest_service("/data", ServeDir::new(data_path))
        .nest_service("/asset", ServeDir::new(assets_path));

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{port}"))
        .await
        .unwrap();

    println!("File server listening on port {port}");

    axum::serve(listener, app).await.unwrap();
}
