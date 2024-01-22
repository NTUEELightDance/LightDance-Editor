//! Mutations for the GraphQL API.

pub mod color;
pub mod led;
pub mod position_frame;
pub mod position_map;
pub mod request_edit;

use color::*;
use led::*;
use position_frame::*;
use position_map::*;
use request_edit::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct MutationRoot(
    ColorMutation,
    PositionFrameMutation,
    PositionMapMutation,
    RequestEditMutation,
    LEDMutation,
);
