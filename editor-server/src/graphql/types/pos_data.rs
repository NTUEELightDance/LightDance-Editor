//! PosData scalar types.

use crate::types::global::RedisPosition;

use async_graphql::{InputObject, Scalar, ScalarType, SimpleObject, Value};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(InputObject, SimpleObject, Serialize, Deserialize, Default, Clone)]
pub struct FrameData {
    #[serde(rename = "createFrames")]
    pub create_frames: HashMap<String, RedisPosition>,
    #[serde(rename = "deleteFrames")]
    pub delete_frames: Vec<String>,
    #[serde(rename = "updateFrames")]
    pub update_frames: HashMap<String, RedisPosition>,
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
