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
    #[serde(rename = "UPDATED_DELETED")]
    UpdatedDeleted,
    #[serde(rename = "CREATED_DELETED")]
    CreatedDeleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct ControlRecordPayload {
    pub mutation: ControlRecordMutationMode,
    pub index: i32,
    #[graphql(name = "addID")]
    pub add_id: Vec<i32>,
    #[graphql(name = "updateID")]
    pub update_id: Vec<i32>,
    #[graphql(name = "deleteID")]
    pub delete_id: Vec<i32>,
}

#[derive(Default)]
pub struct ControlRecordSubscription;

#[Subscription]
impl ControlRecordSubscription {
    async fn control_record_subscription(&self) -> impl Stream<Item = ControlRecordPayload> {
        Subscriptor::<ControlRecordPayload>::subscribe()
    }
}
