//! PositionFrame type.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct PositionFrameRevision {
    pub meta: i32,
    pub data: i32,
}

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct PositionFrame {
    pub id: i32,
    pub start: i32,
    pub rev: PositionFrameRevision,
}

impl From<&PositionFrame> for PositionFrame {
    fn from(data: &PositionFrame) -> Self {
        Self {
            id: data.id,
            start: data.start,
            rev: PositionFrameRevision {
                meta: data.rev.meta,
                data: data.rev.data,
            },
        }
    }
}
