mod db;
mod global;
mod graphql;
mod routes;
mod server;
mod types;

use crate::db::clients::AppClients;
use crate::graphql::schema::build_schema;
use crate::routes::{api::build_api_routes, graphql::build_graphql_routes};

use axum::Router;
use std::env::var;
use std::fs;
use std::path::Path;
use std::sync::Arc;

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    dotenv::dotenv().ok();

    // Set environment type in global env
    let env = var("ENV").expect("ENV is not set");
    global::env::set(env).expect("Failed to set env");

    // Set database clients in global clients
    let mysql_host = var("DATABASE_URL").expect("DATABASE_URL is not set");
    let redis_host = var("REDIS_HOST").expect("REDIS_HOST is not set");
    let redis_port = var("REDIS_PORT").expect("REDIS_PORT is not set");

    global::clients::set(Arc::new(
        AppClients::connect(mysql_host, (redis_host, redis_port)).await,
    ))
    .expect("Failed to set clients");

    // Build graphql schema
    let schema = build_schema();

    if let Err(write_error) = fs::write(Path::new("schema.graphql"), schema.sdl()) {
        println!("Error writing schema file: {}", write_error);
    }

    // Build server
    let app = Router::new()
        .nest("/", build_graphql_routes(schema))
        .nest("/api", build_api_routes());

    let server_port = std::env::var("SERVER_PORT").unwrap_or_else(|_| "4000".to_string());

    println!("Server is ready!");
    println!("Listening on port {}", server_port);
    println!("GraphiQL: http://localhost:{}/graphql", server_port);

    axum::Server::bind(&format!("0.0.0.0:{}", server_port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
