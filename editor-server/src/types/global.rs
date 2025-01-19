//! Global structs and enums that are used throughout the application.

use crate::db::clients::AppClients;
use async_graphql::Enum;
use serde::{Deserialize, Serialize};
use sqlx::Type;

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub clients: &'static AppClients,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct PartControl(pub i32, pub i32); // [id: number, alpha: number]

impl From<String> for PartType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "LED" => PartType::LED,
            "FIBER" => PartType::FIBER,
            _ => panic!("Invalid PartType value: {}", data),
        }
    }
}

#[derive(Type, Enum, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Debug, Default)]
pub enum PartType {
    #[default]
    LED,
    FIBER,
}

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
pub struct RedisPosition {
    pub start: i32,
    pub editing: Option<String>,
    pub rev: Revision,
    pub position: Vec<[f64; 3]>,
    pub rotation: Vec<[f64; 3]>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct DBRevision {
    pub uuid: String,
    pub time: String,
}
