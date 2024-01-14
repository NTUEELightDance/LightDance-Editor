//! Postion Frame data types.

use crate::db::types::editing_position_frame::EditingPositionFrameData;
use crate::db::types::position::PositionData;
use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct PositionFrameData {
    pub id: i32,
    pub start: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct PositionFrame {
    pub id: i32,
    pub start: i32,
    pub editing: Option<EditingPositionFrameData>,
    pub position_datas: Vec<PositionData>,
}
