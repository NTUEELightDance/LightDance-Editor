//! Control type.

//use crate::db::types::control::ControlData;

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct Control {
    pub id: i32,
    pub control: String,
    pub control_code: Vec<i32>,
}

impl From<ControlData> for Control {
    fn from(data: ControlData) -> Self {
        Self {
            id: data.id,
            control: data.name.clone(),
            control_code: vec![data.r, data.g, data.b],
        }
    }
}
