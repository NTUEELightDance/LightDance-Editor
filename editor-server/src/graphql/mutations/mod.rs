//! Mutations for the GraphQL API.

pub mod color;
pub mod dancer;

use color::*;
use dancer::*;

#[derive(async_graphql::MergedObject, Default)]
//pub struct MutationRoot(ColorMutation);
pub struct MutationRoot(ColorMutation, DancerMutation);
