//! Global structs and enums that are used throughout the application.

use crate::db::clients::AppClients;

use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub app_state: Arc<AppClients>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PartControl(pub String, pub i32);
// pub enum PartControl {
//     #[serde(untagged)]
//     LED(String, i32),
//     #[serde(untagged)]
//     FIBER(String, i32),
// }

#[derive(Debug, Deserialize, Serialize)]
pub struct RedisControl {
    pub fade: bool,
    pub start: i32,
    pub editing: Option<String>,
    pub status: Vec<Vec<PartControl>>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PositionPos(pub f64, pub f64, pub f64);

#[derive(Debug, Deserialize, Serialize)]
pub struct RedisPosition {
    pub start: i32,
    pub editing: Option<String>,
    pub pos: Vec<PositionPos>,
}
