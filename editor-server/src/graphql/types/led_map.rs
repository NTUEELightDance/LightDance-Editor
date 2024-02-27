//! LED type.

use crate::graphql::types::led::LED;
use async_graphql::{scalar, SimpleObject};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct LEDMapCustomScalar(pub HashMap<String, HashMap<String, HashMap<String, LED>>>);

scalar!(LEDMapCustomScalar);

#[derive(SimpleObject)]
#[graphql(name = "LEDMap")]
pub struct LEDMap {
    #[graphql(name = "LEDMap")]
    pub led_map: LEDMapCustomScalar,
}
