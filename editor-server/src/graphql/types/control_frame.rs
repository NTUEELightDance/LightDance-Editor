//! ControlFrame type.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct ControlFrameRevision {
    pub meta: i32,
    pub data: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct ControlFrame {
    pub id: i32,
    pub start: i32,
    // pub fade: bool,
    pub rev: ControlFrameRevision,
}

impl From<&ControlFrame> for ControlFrame {
    fn from(data: &ControlFrame) -> Self {
        Self {
            id: data.id,
            start: data.start,
            // fade: data.fade,
            rev: ControlFrameRevision {
                meta: data.rev.meta,
                data: data.rev.data,
            },
        }
    }
}

pub enum ControlDataType {
    COLOR,
    EFFECT,
}
