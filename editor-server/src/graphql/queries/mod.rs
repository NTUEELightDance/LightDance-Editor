//! Queries for the GraphQL API.

pub mod color;
pub mod position_frame;
pub mod position_map;
pub mod led;

use color::*;
use position_frame::*;
use position_map::*;
use led::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(ColorQuery, PositionFrameQuery, PositionMapQuery, LEDQuery);

