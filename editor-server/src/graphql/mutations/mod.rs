//! Mutations for the GraphQL API.

pub mod color;
pub mod dancer;
pub mod part;

use color::*;
use dancer::*;
use part::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct MutationRoot(ColorMutation, DancerMutation, PartMutation);
