//! Postion data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
// ref: sea-orm/migration/src/m20260131_000001_create_table.rs PositionData type
pub struct PositionData {
    pub dancer_id: i32,
    pub frame_id: i32,
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub rx: f64,
    pub ry: f64,
    pub rz: f64,
}
