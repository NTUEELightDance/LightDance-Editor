//! Mutations for the GraphQL API.

pub mod color;
pub mod control_frame;
pub mod control_map;
pub mod dancer;
pub mod led;
pub mod part;
pub mod part_order;
pub mod position_frame;
pub mod position_map;
pub mod request_edit;
pub mod shift;

use color::*;
use control_frame::*;
use control_map::*;
use dancer::*;
use led::*;
use part_order::*;
use part::*;
use position_frame::*;
use position_map::*;
use request_edit::*;
use shift::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct MutationRoot(
    ColorMutation,
    ControlFrameMutation,
    ControlMapMutation,
    PositionFrameMutation,
    PositionMapMutation,
    RequestEditMutation,
    LEDMutation,
    DancerMutation,
    PartMutation,
    FrameMutation,
    PartOrderMutation,
);
