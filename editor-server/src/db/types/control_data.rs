//! ControlData type.

use crate::db::types::part::PartType;

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ControlData {
    pub part_id: i32,
    pub frame_id: i32,
    pub part_type: PartType,
    pub color_id: Option<i32>,
    pub effect_id: Option<i32>,
    pub alpha: i32,
}
