//! PositionMap scalar types

use async_graphql::{InputObject, Scalar, ScalarType, SimpleObject, Value};
use serde::{Deserialize, Serialize};

#[derive(InputObject, SimpleObject, Serialize, Deserialize)]
pub struct MapID {
    pub id: i32,
}

#[derive(Serialize, Deserialize)]
pub struct PositionMapScalar(pub Vec<MapID>);

#[Scalar]
impl ScalarType for PositionMapScalar {
    fn parse(value: async_graphql::Value) -> async_graphql::InputValueResult<Self> {
        Ok(async_graphql::from_value(value)?)
    }

    fn to_value(&self) -> Value {
        Value::List(
            self.0
                .iter()
                .map(|map_id| Value::Number(map_id.id.into()))
                .collect(),
        )
    }
}

#[derive(SimpleObject)]
pub struct PositionMap {
    pub frame_ids: PositionMapScalar,
}
