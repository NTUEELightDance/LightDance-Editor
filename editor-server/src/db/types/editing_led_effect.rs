//! EditingLEDEffect data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct EditingLEDEffectData {
    pub user_id: i32,
    pub led_effect_id: Option<i32>,
}
