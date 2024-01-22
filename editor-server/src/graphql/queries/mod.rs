//! Queries for the GraphQL API.

pub mod color;
pub mod led;
pub mod position_frame;
pub mod position_map;
pub mod control_frame;
pub mod control_map;

use color::*;
use led::*;
use position_frame::*;
use position_map::*;
use control_frame::*;
use control_map::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(
    ColorQuery, 
    PositionFrameQuery,
    PositionMapQuery,
    ControlFrameQuery,
    ControlMapQuery,
    LEDQuery, 
);