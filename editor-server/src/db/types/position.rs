//! Postion data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
// ref: prisma/schema.prisma PositionData type
pub struct PositionData {
    pub dancer_id: i32,
    pub frame_id: i32,
    pub r#type: String,
    pub x: Option<f64>,
    pub y: Option<f64>,
    pub z: Option<f64>,
    pub rx: Option<f64>,
    pub ry: Option<f64>,
    pub rz: Option<f64>,
}
