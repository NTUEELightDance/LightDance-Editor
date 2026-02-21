//! PositionMap scalar types

use crate::{graphql::types::control_data::RedisControlSubscription, types::global::RedisPosition};
use async_graphql::{InputObject, Scalar, ScalarType, SimpleObject, Value};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(InputObject, SimpleObject, Serialize, Deserialize)]
pub struct MapID {
    pub id: i32,
}

// PositionMap scalar types
#[derive(Serialize, Deserialize)]
pub struct PositionMapScalar(pub HashMap<String, RedisPosition>);

#[Scalar]
impl ScalarType for PositionMapScalar {
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
pub struct PositionMap {
    pub frame_ids: PositionMapScalar,
}

// ControlMap scalar types
#[derive(Serialize, Deserialize)]
pub struct ControlMapScalar(pub HashMap<String, RedisControlSubscription>);

#[Scalar]
impl ScalarType for ControlMapScalar {
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
pub struct ControlMap {
    pub frame_ids: ControlMapScalar,
}
