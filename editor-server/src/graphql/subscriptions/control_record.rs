//! Color subscription methods.

use crate::graphql::subscriptor::Subscriptor;

use async_graphql::{Enum, SimpleObject, Subscription};
use futures_core::stream::Stream;
use serde::{Deserialize, Serialize};

#[derive(Enum, Clone, Copy, Eq, PartialEq, Default, Serialize, Deserialize)]
pub enum ControlRecordMutationMode {
    #[default]
    #[serde(rename = "UPDATED")]
    Updated,
    #[serde(rename = "CREATED")]
    Created,
    #[serde(rename = "DELETED")]
    Deleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct ControlRecordPayload {
    pub mutation: ControlRecordMutationMode,
    pub index: i32,
    pub add_id: Vec<i32>,
    pub update_id: Vec<i32>,
    pub delete_id: Vec<i32>,
    pub edit_by: i32,
}

#[derive(Default)]
pub struct ControlRecordSubscription;

#[Subscription]
impl ControlRecordSubscription {
    async fn control_record_subscription(&self) -> impl Stream<Item = ControlRecordPayload> {
        Subscriptor::<ControlRecordPayload>::subscribe()
    }
}
