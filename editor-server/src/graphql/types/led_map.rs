//! LED type.

use crate::graphql::types::led::LED;
use async_graphql::{Scalar, ScalarType, SimpleObject, Value};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct LEDMapScalar(pub HashMap<String, HashMap<String, LED>>);

#[Scalar]
impl ScalarType for LEDMapScalar {
    fn parse(value: async_graphql::Value) -> async_graphql::InputValueResult<Self> {
        Ok(async_graphql::from_value(value)?)
    }

    fn to_value(&self) -> Value {
        Value::Object(
            self.0
                .iter()
                .map(|(k, v)| {
                    (
                        async_graphql::Name::new(k),
                        async_graphql::to_value(v).unwrap(),
                    )
                })
                .collect(),
        )
    }
}

#[derive(SimpleObject)]
pub struct LEDMap {
    pub led_map: LEDMapScalar,
}
