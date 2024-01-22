//! Dancer subscription methods.

use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::dancer::Dancer;

use async_graphql::{Enum, SimpleObject, Subscription};
use futures_core::stream::Stream;
use serde::{Deserialize, Serialize};

#[derive(Enum, Clone, Copy, Eq, PartialEq, Default, Serialize, Deserialize)]
pub enum DancerMutationMode {
    #[default]
    #[serde(rename = "UPDATED")]
    Updated,
    #[serde(rename = "CREATED")]
    Created,
    #[serde(rename = "DELETED")]
    Deleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct DancerPayload {
    pub mutation: DancerMutationMode,
    pub dancer_data: Option<Dancer>,
    pub edit_by: i32,
}

#[derive(Default)]
pub struct DancerSubscription;

#[Subscription]
impl DancerSubscription {
    async fn dancer_subscription(&self) -> impl Stream<Item = DancerPayload> {
        Subscriptor::<DancerPayload>::subscribe()
    }
}
