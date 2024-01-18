//! Mutations for the GraphQL API.

pub mod color;
pub mod led;

use color::*;
use led::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct MutationRoot(ColorMutation, LEDMutation);
