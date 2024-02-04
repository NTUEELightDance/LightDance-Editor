//! Dancer type.

use crate::db::types::{dancer::DancerData, part::PartType, position::PositionData};

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, SimpleObject, Debug, Deserialize, Serialize, Clone)]
pub struct Part {
    pub id: i32,
    pub model_id: i32,
    pub name: String,
    pub r#type: PartType,
    pub length: Option<i32>,
}

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct Dancer {
    pub id: i32,
    pub name: String,
    pub parts: Option<Vec<Part>>,
    pub position_datas: Option<Vec<PositionData>>,
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
