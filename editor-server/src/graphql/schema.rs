//! GraphQL schema type.
use crate::graphql::{MutationRoot, QueryRoot, SubscriptionRoot};

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
