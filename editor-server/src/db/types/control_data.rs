//! ControlData type.

use crate::types::global::PartType;
use sqlx::Decode;

#[derive(Debug, Clone, PartialEq, Decode)]
pub enum ControlType {
    #[sqlx(rename = "COLOR")]
    Color,
    #[sqlx(rename = "EFFECT")]
    Effect,
    #[sqlx(rename = "LED_BULBS")]
    LEDBulbs,
    #[sqlx(rename = "NO_EFFECT")]
    NoEffect,
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

impl From<ControlType> for String {
    fn from(val: ControlType) -> Self {
        match val {
            ControlType::Effect => "EFFECT".to_string(),
            ControlType::Color => "COLOR".to_string(),
            ControlType::LEDBulbs => "LED_BULBS".to_string(),
            ControlType::NoEffect => "NO_EFFECT".to_string(),
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
