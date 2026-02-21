//! ControlData scalar types.

use crate::types::global::{RedisControl, RedisPartControlBulbs, RedisPartControlData, Revision};
use async_graphql::{scalar, InputObject, SimpleObject};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct RedisControlSubscription {
    // temporarily remove fade
    // pub fade: bool,
    pub start: i32,
    pub rev: Revision,
    pub editing: i32,
    pub status: Vec<Vec<RedisPartControlData>>,
    pub led_status: Vec<Vec<RedisPartControlBulbs>>,
    pub fade: Vec<bool>,
    pub has_effect: Vec<bool>,
}

impl From<RedisControl> for RedisControlSubscription {
    fn from(value: RedisControl) -> Self {
        Self {
            start: value.start,
            rev: value.rev,
            editing: value.editing.unwrap_or_default(),
            status: value
                .status
                .into_iter()
                .map(|data| {
                    data.into_iter()
                        .map(|control| match control {
                            Some(c) => c,
                            None => RedisPartControlData(0, 0),
                        })
                        .collect()
                })
                .collect(),
            led_status: value.led_status,
            fade: value.fade,
            has_effect: value.has_effect,
        }
    }
}

#[derive(InputObject, SimpleObject, Serialize, Deserialize, Default, Clone)]
pub struct ControlFramesSubData {
    #[serde(rename = "createFrames")]
    pub create_frames: HashMap<String, RedisControlSubscription>,
    #[serde(rename = "deleteFrames")]
    pub delete_frames: Vec<i32>,
    #[serde(rename = "updateFrames")]
    pub update_frames: HashMap<String, RedisControlSubscription>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct ControlFramesSubDatScalar(pub ControlFramesSubData);

scalar!(ControlFramesSubDatScalar);
