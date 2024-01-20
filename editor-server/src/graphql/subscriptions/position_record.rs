//! PositionRecord subscription methods.

use crate::graphql::subscriptor::Subscriptor;

use async_graphql::{Enum, SimpleObject, Subscription};
use futures_core::stream::Stream;
use serde::{Deserialize, Serialize};

#[derive(Enum, Clone, Copy, Eq, PartialEq, Default, Serialize, Deserialize)]
pub enum PositionRecordMutationMode {
    #[default]
    #[serde(rename = "CREATED_DELETED")]
    CreatedDeleted,
    #[serde(rename = "UPDATED_DELETED")]
    UpdatedDeleted,
    #[serde(rename = "CREATED")]
    Created,
    #[serde(rename = "UPDATED")]
    Updated,
    #[serde(rename = "DELETED")]
    Deleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct PositionRecordPayload {
    pub mutation: PositionRecordMutationMode,
    pub edit_by: i32,
    pub add_id: Vec<i32>,
    pub update_id: Vec<i32>,
    pub delete_id: Vec<i32>,
    pub index: i32,
}

#[derive(Default)]
pub struct PositionRecordSubscription;

#[Subscription]
impl PositionRecordSubscription {
    async fn position_record_subscription(&self) -> impl Stream<Item = PositionRecordPayload> {
        Subscriptor::<PositionRecordPayload>::subscribe()
    }
}
