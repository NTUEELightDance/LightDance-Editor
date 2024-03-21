//! Global structs and enums that are used throughout the application.

use crate::db::clients::AppClients;
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub clients: &'static AppClients,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub enum PartControl {
    #[serde(untagged)]
    LED(String, i32),
    #[serde(untagged)]
    LEDBulbs(Vec<(String, i32)>),
    #[serde(untagged)]
    FIBER(String, i32),
}

// pub enum PartControl {
//     #[serde(untagged)]
//     LED(String, i32),
//     #[serde(untagged)]
//     FIBER(String, i32),
// }

#[derive(Debug, Deserialize, Serialize, Clone, Default)]
pub struct Revision {
    pub meta: i32,
    pub data: i32,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisControl {
    pub fade: bool,
    pub start: i32,
    pub rev: Revision,
    pub editing: Option<String>,
    pub status: Vec<Vec<PartControl>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PositionPos(pub f64, pub f64, pub f64);

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisPosition {
    pub start: i32,
    pub editing: Option<String>,
    pub rev: Revision,
    pub pos: Vec<PositionPos>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DBRevision {
    pub uuid: String,
    pub time: String,
}
