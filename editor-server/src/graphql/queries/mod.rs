//! Queries for the GraphQL API.

pub mod color;

use color::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(ColorQuery);