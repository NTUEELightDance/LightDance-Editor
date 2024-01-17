//! Part data types.
use sqlx::{Decode, FromRow};

#[derive(FromRow, Debug, Clone)]
pub struct PartData {
    pub id: i32,
    pub dancer_id: i32,
    pub name: String,
    pub r#type: PartType,
    pub length: i32,
}

#[derive(Debug, Decode, Clone)]
pub enum PartType {
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
