//! Dancer type.

use crate::db::types::dancer::DancerData;
use crate::db::types::part::PartType;

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Debug, Deserialize, Serialize, Clone)]
pub struct PositionPos {
    pub x: f64,
    pub y: f64,
    pub z: f64,
}

#[derive(SimpleObject, Debug, Deserialize, Serialize, Clone)]
pub struct Position {
    pub id: i32,
    pub start: i32,
    pub editing: Option<String>,
    pub pos: Vec<PositionPos>,
}

#[derive(SimpleObject, Debug, Deserialize, Serialize, Clone)]
pub struct Part {
    pub id: i32,
    pub dancer_id: i32,
    pub name: String,
    pub r#type: PartType,
    pub length: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct Dancer {
    pub id: i32,
    pub name: String,
    pub parts: Option<Vec<Part>>,
    pub position_datas: Option<Vec<Position>>,
}

impl From<DancerData> for Dancer {
    fn from(data: DancerData) -> Self {
        Self {
            id: data.id,
            name: data.name,
            parts: None,
            position_datas: None,
        }
    }
}
