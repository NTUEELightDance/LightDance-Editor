//! Queries for the GraphQL API.

pub mod color;
pub mod position_frame;
pub mod position_map;

use color::*;
use position_frame::*;
use position_map::*;

#[derive(async_graphql::MergedObject, Default)]
pub struct QueryRoot(ColorQuery, PositionFrameQuery, PositionMapQuery);
