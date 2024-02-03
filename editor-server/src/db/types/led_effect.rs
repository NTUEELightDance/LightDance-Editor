//! LEDEffect data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
#[graphql(name = "LEDEffectData")]
pub struct LEDEffectData {
    pub id: i32,
    pub name: String,
<<<<<<< HEAD
    pub model_id: i32,
=======
    pub dancer_id: i32,
>>>>>>> 1424e6b (add dancer layer to LED map)
    pub part_id: i32,
}
