//! Color subscription methods.

use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::control_data::ControlFramesSubDatScalar;

use async_graphql::{SimpleObject, Subscription};
use futures_core::stream::Stream;

#[derive(SimpleObject, Clone, Default)]
pub struct ControlMapPayload {
    pub frame: ControlFramesSubDatScalar,
    pub edit_by: i32,
}

#[derive(Default)]
pub struct ControlMapSubscription;

#[Subscription]
impl ControlMapSubscription {
    async fn control_map_subscription(&self) -> impl Stream<Item = ControlMapPayload> {
        Subscriptor::<ControlMapPayload>::subscribe()
    }
}
