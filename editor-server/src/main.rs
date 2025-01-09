pub mod db;
pub mod global;
pub mod graphql;
pub mod routes;
pub mod server;
pub mod tracing;
pub mod types;
pub mod utils;

use crate::db::clients::AppClients;
use crate::graphql::schema::build_schema;
use crate::routes::{api::build_api_routes, graphql::build_graphql_routes};
use crate::utils::{
    authentication::create_admin_user,
    data::{init_redis_control, init_redis_position},
};

use axum::Router;
use std::fs;
use std::path::Path;
use tracing::build_trace_layer;

#[tokio::main(flavor = "multi_thread", worker_threads = 20)]
pub async fn main() {
    dotenv::dotenv().ok();

    // Set global environment variables
    global::envs::set();

    // Set database clients in global clients
    let mysql_host = env!("DATABASE_URL", "DATABASE_URL is not set");
    let redis_host = env!("REDIS_HOST", "REDIS_HOST is not set");
    let redis_port = env!("REDIS_PORT", "REDIS_PORT is not set");

    global::clients::set(AppClients::connect(mysql_host, (redis_host, redis_port)).await).unwrap();

    // Create admin user
    create_admin_user()
        .await
        .expect("Error creating admin user.");

    println!("Admin user created.");

    // Initialize redis control and position
    let clients = global::clients::get();

    init_redis_control(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis control.");
    init_redis_position(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis position.");

    // Build graphql schema
    let schema = build_schema();

    if let Err(write_error) = fs::write(Path::new("schema.graphql"), schema.sdl()) {
        println!("Error writing schema file: {}", write_error);
    }

    // Build server
    let app = Router::new()
        .nest("/", build_graphql_routes(schema))
        .nest("/api", build_trace_layer(build_api_routes()));

    let server_port = option_env!("SERVER_PORT")
        .unwrap_or("4000")
        .parse()
        .unwrap();

    println!("Server is ready!");
    tracing::init_tracing(server_port);
    println!("GraphiQL: http://localhost:{}/graphql", server_port);

    // Start server
    axum::Server::bind(&format!("[::]:{}", server_port).parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
