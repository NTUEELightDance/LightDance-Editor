use axum::Router;
use db::clients::AppClients;
use graphql::schema::build_schema;

pub mod db;
pub mod global;
pub mod graphql;
pub mod routes;
pub mod server;
pub mod tracing;
pub mod types;
pub mod utils;

use crate::routes::{api::build_api_routes, graphql::build_graphql_routes};
use crate::tracing::{build_api_tracer, build_graphql_tracer};
use crate::utils::{
    authentication::create_admin_user,
    data::{init_redis_control, init_redis_position},
};

pub async fn build_app() -> Router {
    dotenv::dotenv().ok();

    global::envs::set();

    let mysql_host = env!("DATABASE_URL", "DATABASE_URL is not set");
    let redis_host = env!("REDIS_HOST", "REDIS_HOST is not set");
    let redis_port = env!("REDIS_PORT", "REDIS_PORT is not set");

    global::clients::set(AppClients::connect(mysql_host, (redis_host, redis_port)).await).unwrap();

    create_admin_user()
        .await
        .expect("Error creating admin user.");

    println!("Admin user created.");

    let clients = global::clients::get();

    init_redis_control(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis control.");
    init_redis_position(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis position.");

    let schema = build_schema();

    // initialize api tracing
    tracing::init_tracing();

    Router::new()
        .nest("/", build_graphql_tracer(build_graphql_routes(schema)))
        .nest("/api", build_api_tracer(build_api_routes()))
}
