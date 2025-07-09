//! GraphQL routes for Axum server.

use crate::graphql::schema::AppSchema;
use crate::graphql::subscriptor::websocket::GraphQLSubscription;
use crate::server::extractors::Authentication;
use crate::server::websocket::{ws_on_connect, ws_on_disconnect};
use crate::utils::graphiql::GraphiQLBuilder;

use async_graphql::{Request, Response};

use axum::{
    body::{to_bytes, Body},
    // http::{Request as HttpRequest, StatusCode},
    response::{Html, IntoResponse},
    routing::{get, get_service},
    Extension,
    Router,
};

async fn graphql(
    Authentication(context): Authentication,
    Extension(schema): Extension<AppSchema>,
    req: axum::http::Request<Body>,
) -> impl IntoResponse {
    let body_bytes = to_bytes(req.into_body(), 1024 * 1024)
        .await
        .unwrap_or_default();
    let request_json = String::from_utf8(body_bytes.to_vec()).unwrap_or_default();

    match serde_json::from_str::<Request>(&request_json) {
        Ok(graphql_request) => {
            let response: Response = schema.execute(graphql_request.data(context)).await;
            axum::Json(response)
        }
        Err(_) => axum::Json(async_graphql::Response::from_errors(vec![
            async_graphql::ServerError::new("Invalid request payload", None),
        ])),
    }
}

async fn graphiql() -> impl IntoResponse {
    Html(
        GraphiQLBuilder::build()
            .version("2.0.9")
            .endpoint("/graphql")
            .subscription_endpoint("/graphql-websocket")
            .finish(),
    )
}

/// Build GraphQL routes for Axum server.
pub fn build_graphql_routes(schema: AppSchema) -> Router {
    Router::new()
        // Main routes for GraphQL
        .route("/graphql", get(graphiql).post(graphql))
        // Websocket route for GraphQL subscriptions with connection and disconnection callbacks
        .route(
            "/graphql-websocket",
            get_service(GraphQLSubscription::new(ws_on_connect, ws_on_disconnect)),
        )
        // Pass schema as extension to routes
        .layer(Extension(schema))
}
