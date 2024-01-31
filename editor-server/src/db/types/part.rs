//! Part data type
use async_graphql::{Enum, SimpleObject};
use serde::{Deserialize, Serialize};
use sqlx::{FromRow, Type};

#[derive(SimpleObject, FromRow, Debug, Clone)]
pub struct PartData {
    pub id: i32,
    pub dancer_id: i32,
    pub name: String,
    pub r#type: PartType,
    pub length: Option<i32>,
}

#[derive(Type, Enum, Clone, Copy, Eq, PartialEq, Serialize, Deserialize, Debug, Default)]
pub enum PartType {
    #[default]
    LED,
    FIBER,
}

impl From<String> for PartType {
    fn from(data: String) -> Self {
        match data.as_str() {
            "LED" => Self::LED,
            "FIBER" => Self::FIBER,
            _ => panic!("Invalid part type."),
        }
    }
}
