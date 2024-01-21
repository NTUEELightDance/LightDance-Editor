//! Postion data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
// ref: prisma/schema.prisma PositionData type
pub struct PositionData {
    pub dancer_id: i32,
    pub frame_id: i32,
    pub x: f64,
    pub y: f64,
    pub z: f64,
}
