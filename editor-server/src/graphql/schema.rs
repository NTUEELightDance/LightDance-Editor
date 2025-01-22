//! GraphQL schema type.
use crate::{
    graphql::{MutationRoot, QueryRoot, SubscriptionRoot},
    types::global::UserContext,
};

use async_graphql::{extensions::Tracing, Schema};

pub type AppSchema = Schema<QueryRoot, MutationRoot, SubscriptionRoot>;

pub fn build_schema() -> AppSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        SubscriptionRoot::default(),
    )
    .extension(Tracing)
    .finish()
}

pub async fn build_schema_with_context(user_context: UserContext) -> AppSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        SubscriptionRoot::default(),
    )
    .data(user_context)
    .finish()
}
