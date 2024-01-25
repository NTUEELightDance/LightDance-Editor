//! ControlData type.
use sqlx::{Decode, FromRow};

#[derive(FromRow, Debug, Clone)]
pub struct ControlData {
    pub part_id: i32,
    pub frame_id: i32,
    pub r#type: ControlType,
    pub color_id: Option<i32>,
    pub effect_id: Option<i32>,
    pub alpha: i32,
}

#[derive(Debug, Clone, PartialEq, Decode)]
pub enum ControlType {
    COLOR,
    EFFECT,
    LED_BULBS,
}

impl From<String> for ControlType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "EFFECT" => Self::EFFECT,
            "COLOR" => Self::COLOR,
            "LED_BULBS" => Self::LED_BULBS,
            _ => panic!("Invalid control data type."),
        }
    }
}
