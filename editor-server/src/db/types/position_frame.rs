//! Postion Frame data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct PositionFrameData {
    pub id: i32,
    pub start: i32,
    pub meta_rev: i32,
    pub data_rev: i32,
}
