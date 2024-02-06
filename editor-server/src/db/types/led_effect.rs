//! LEDEffect data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
#[graphql(name = "LEDEffectData")]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
    pub model_id: i32,
    pub part_id: i32,
}
