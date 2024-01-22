//! LED type.

use crate::graphql::types::led::LED;
use async_graphql::{scalar, SimpleObject};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct LEDMapCustomScalar(pub HashMap<String, HashMap<String, LED>>);

// #[Scalar]
// impl ScalarType for LEDMapCustomScalar {
//     fn parse(value: async_graphql::Value) -> async_graphql::InputValueResult<Self> {
//         Ok(async_graphql::from_value(value)?)
//     }
//
//     fn to_value(&self) -> Value {
//         Value::Object(
//             self.0
//                 .iter()
//                 .map(|(k, v)| {
//                     (
//                         async_graphql::Name::new(k),
//                         async_graphql::to_value(v).unwrap(),
//                     )
//                 })
//                 .collect(),
//         )
//     }
// }
scalar!(LEDMapCustomScalar);

#[derive(SimpleObject)]
#[graphql(name = "LEDMap")]
pub struct LEDMap {
    #[graphql(name = "LEDMap")]
    pub led_map: LEDMapCustomScalar,
}
