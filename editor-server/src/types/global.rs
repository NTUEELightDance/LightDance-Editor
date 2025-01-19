//! Global structs and enums that are used throughout the application.

use crate::db::clients::AppClients;
use serde::{Deserialize, Serialize};

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub clients: &'static AppClients,
}

#[derive(Debug, Deserialize, Serialize, Clone)] // [id: number, alpha: number]
pub struct PartControl(pub i32, pub i32);
pub type PartControlBulbs = Vec<(i32, i32)>;

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
    pub editing: Option<i32>,
    pub status: Vec<Vec<PartControl>>,
    pub led_status: Vec<Vec<PartControlBulbs>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PositionPos(pub f64, pub f64, pub f64);

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisPosition {
    pub start: i32,
    pub editing: Option<i32>,
    pub rev: Revision,
    pub pos: Vec<PositionPos>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DBRevision {
    pub uuid: String,
    pub time: String,
}
