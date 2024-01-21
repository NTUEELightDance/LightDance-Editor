//! PosData scalar types.

use async_graphql::{InputObject, Scalar, ScalarType, SimpleObject, Value};
use serde::{Deserialize, Serialize};

#[derive(InputObject, SimpleObject, Serialize, Deserialize, Clone, Default)]
pub struct FrameData {
    #[serde(rename = "createList")]
    pub create_list: Vec<i32>,
    #[serde(rename = "deleteList")]
    pub delete_list: Vec<i32>,
    #[serde(rename = "updateList")]
    pub update_list: Vec<i32>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct PosDataScalar(pub FrameData);

#[Scalar]
impl ScalarType for PosDataScalar {
    fn parse(value: Value) -> async_graphql::InputValueResult<Self> {
        Ok(async_graphql::from_value(value)?)
    }

    fn to_value(&self) -> Value {
        async_graphql::to_value(&self.0).unwrap()
    }
}

#[derive(SimpleObject)]
pub struct PosData {
    pub frame_ids: PosDataScalar,
}
