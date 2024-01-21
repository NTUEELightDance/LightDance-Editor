//! Mutations for the GraphQL API.

pub mod color;
pub mod position_frame;
pub mod position_map;
pub mod request_edit;
pub mod dancer;

use color::*;
use position_frame::*;
use position_map::*;
use request_edit::*;
use dancer::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct MutationRoot(
    ColorMutation,
    PositionFrameMutation,
    PositionMapMutation,
    RequestEditMutation, 
    DancerMutation,
);
