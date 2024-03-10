//! ControlData type.

use crate::db::types::part::PartType;

use sqlx::Decode;

#[derive(Debug, Clone, PartialEq, Decode)]
pub enum ControlType {
    Color,
    Effect,
    LEDBulbs,
}

impl From<String> for ControlType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "EFFECT" => Self::Effect,
            "COLOR" => Self::Color,
            "LED_BULBS" => Self::LEDBulbs,
            _ => panic!("Invalid control data type."),
        }
    }
}

#[derive(sqlx::FromRow, Debug, Clone)]
pub struct ControlData {
    pub part_id: i32,
    pub frame_id: i32,
    pub part_type: PartType,
    pub r#type: ControlType,
    pub color_id: Option<i32>,
    pub effect_id: Option<i32>,
    pub alpha: i32,
}
