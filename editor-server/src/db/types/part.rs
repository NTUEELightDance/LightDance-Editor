//! Part data type
use async_graphql::SimpleObject;
use sqlx::FromRow;

use crate::types::global::PartType;

#[derive(SimpleObject, FromRow, Debug, Clone)]
pub struct PartData {
    pub id: i32,
    pub model_id: i32,
    pub name: String,
    pub r#type: PartType,
    pub length: Option<i32>,
}
