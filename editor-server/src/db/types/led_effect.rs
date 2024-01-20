//! LEDEffect data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
    pub part_name: String,
}
