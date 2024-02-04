//! Global structs and enums that are used throughout the application.

use crate::db::clients::AppClients;
use async_graphql::Enum;
use serde::{Deserialize, Serialize};
use sqlx::Type;
use std::collections::HashMap;

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub clients: &'static AppClients,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PartControl(pub i32, pub i32); // [id: number, alpha: number]

// pub enum PartControl {
//     #[serde(untagged)]
//     LED(String, i32),
//     #[serde(untagged)]
//     FIBER(String, i32),
// }

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisControl {
    pub fade: bool,
    pub start: i32,
    pub editing: Option<String>,
    pub status: Vec<Vec<PartControl>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PositionPos(pub f64, pub f64, pub f64);

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisPosition {
    pub start: i32,
    pub editing: Option<String>,
    pub pos: Vec<PositionPos>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TPositionData {
    pub start: i32,
    pub pos: Vec<PositionPos>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TColorData(pub i32, pub i32, pub i32); // [r: number, g: number, b: number]

impl From<String> for TPartType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "LED" => TPartType::LED,
            "FIBER" => TPartType::FIBER,
            _ => panic!("Invalid TPartType value: {}", data),
        }
    }
}

#[derive(Type, Enum, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Debug, Default)]
pub enum TPartType {
    #[default]
    LED,
    FIBER,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TPartData {
    pub name: String,
    pub r#type: TPartType,
    pub length: Option<i32>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TDancerData {
    pub parts: Vec<TPartData>,
    pub position_data: Option<Vec<TPositionData>>,
    pub name: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TExportLEDFrameLED(pub String, pub i32);

#[derive(Debug, Deserialize, Serialize)]
pub struct TExportLEDFrame {
    pub leds: Vec<TExportLEDFrameLED>,
    pub start: i32,
    pub fade: bool,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct TExportLEDPart {
    pub repeat: i32,
    pub frames: Vec<TExportLEDFrame>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TELControl(pub i32); // [value: number]

#[derive(Debug, Deserialize, Serialize)]
pub struct TControlData {
    pub fade: bool,
    pub start: i32,
    pub status: Vec<Vec<TPartControl>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct TPartControl(pub String, pub i32); // TLEDControl: [src: string, alpha: number] or TFiberControl: [color: string, alpha: number]

#[derive(Debug, Deserialize, Serialize)]
pub struct TExportData {
    pub position: HashMap<String, TPositionData>,
    pub control: HashMap<String, TControlData>,
    pub dancer: Vec<TDancerData>,
    pub color: HashMap<String, TColorData>,
    pub led_effects: HashMap<String, HashMap<String, TExportLEDPart>>,
}

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct LED(pub i32, pub i32);

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct LEDEffectFrame {
    pub leds: Vec<LED>,
    pub fade: bool,
    pub start: i32,
}

#[derive(Serialize, Deserialize, Default, Debug, Clone)]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
    pub part_name: String,
    pub repeat: i32,
    pub frames: Vec<LEDEffectFrame>,
}
