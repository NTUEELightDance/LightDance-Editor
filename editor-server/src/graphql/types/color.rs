use crate::db::types::color::ColorData;

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct Color {
    pub id: i32,
    pub color: String,
    pub color_code: Vec<i32>,
}

impl From<ColorData> for Color {
    fn from(data: ColorData) -> Self {
        Self {
            id: data.id,
            color: data.name.clone(),
            color_code: vec![data.r, data.g, data.b],
        }
    }
}
