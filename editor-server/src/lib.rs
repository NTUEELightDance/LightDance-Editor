use axum::Router;
use db::clients::AppClients;
use graphql::schema::{self, AppSchema};
use load_dotenv::load_dotenv;
use utils::authentication::get_test_user_context;

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
use crate::utils::data::{init_redis_control, init_redis_position};

pub async fn init() {
    load_dotenv!();
    global::envs::set();
    dotenv::dotenv().ok();

    let mysql_host = env!("DATABASE_URL", "DATABASE_URL is not set");
    let redis_host = env!("REDIS_HOST", "REDIS_HOST is not set");
    let redis_port = env!("REDIS_PORT", "REDIS_PORT is not set");

    global::clients::set(AppClients::connect(mysql_host, (redis_host, redis_port)).await);

    let clients = global::clients::get();

    init_redis_control(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis control.");
    init_redis_position(clients.mysql_pool(), clients.redis_client())
        .await
        .expect("Error initializing redis position.");
}

pub async fn build_app() -> Router {
    init().await;
    tracing::init_tracing();

    let schema = schema::build_schema();

    Router::new()
        .merge(build_graphql_tracer(build_graphql_routes(schema)))
        .nest("/api", build_api_tracer(build_api_routes()))
}

pub async fn build_graphql() -> AppSchema {
    init().await;
    let user_context = get_test_user_context().await.unwrap();
    schema::build_schema_with_context(user_context).await
}
