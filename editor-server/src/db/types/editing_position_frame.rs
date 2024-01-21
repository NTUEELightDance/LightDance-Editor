//! EditingPositionFrame data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default)]
pub struct EditingPositionFrameData {
    pub user_id: i32,
    pub frame_id: Option<i32>,
}
