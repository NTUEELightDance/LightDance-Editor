//! Queries for the GraphQL API.

pub mod color;
pub mod led;

use color::*;
use led::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(ColorQuery, LEDQuery);
