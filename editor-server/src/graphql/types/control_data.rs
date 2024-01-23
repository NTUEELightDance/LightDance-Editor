//! ColorData scalar types.

use crate::types::global::RedisControl;

use async_graphql::{scalar, InputObject, SimpleObject};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(InputObject, SimpleObject, Serialize, Deserialize, Default, Clone)]
pub struct ControlFramesSubData {
    #[serde(rename = "createFrames")]
    pub create_frames: HashMap<String, RedisControl>,
    #[serde(rename = "deleteFrames")]
    pub delete_frames: Vec<i32>,
    #[serde(rename = "updateFrames")]
    pub update_frames: HashMap<String, RedisControl>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct ControlFramesSubDatScalar(pub ControlFramesSubData);

scalar!(ControlFramesSubDatScalar);
