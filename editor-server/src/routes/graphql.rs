use crate::graphql::schema::AppSchema;
use crate::graphql::subscriptor::websocket::GraphQLSubscription;
use crate::server::extractors::Authentication;
use crate::server::websocket::{ws_on_connect, ws_on_disconnect};

use async_graphql::http::GraphiQLSource;
use async_graphql_axum::{GraphQLRequest, GraphQLResponse};
use axum::{
    response::{Html, IntoResponse},
    routing::{get, get_service},
    Extension, Router,
};

async fn graphql(
    Authentication(context): Authentication,
    schema: Extension<AppSchema>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner().data(context)).await.into()
}

async fn graphiql() -> impl IntoResponse {
    Html(
        GraphiQLSource::build()
            .endpoint("/graphql-backend")
            .subscription_endpoint("/graphql-backend-websocket")
            .finish(),
    )
}

pub fn build_graphql_routes(schema: AppSchema) -> Router {
    Router::new()
        // Main routes for GraphQL
        .route("/graphql-backend", get(graphiql).post(graphql))
        // Websocket route for GraphQL subscriptions with connection and disconnection callbacks
        .route(
            "/graphql-backend-websocket",
            get_service(GraphQLSubscription::new(ws_on_connect, ws_on_disconnect)),
        )
        // Pass schema as extension to routes
        .layer(Extension(schema))
}
