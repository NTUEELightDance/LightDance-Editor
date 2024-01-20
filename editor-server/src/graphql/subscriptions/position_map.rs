//! PositionMap subscription methods.

use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::pos_data::PosDataScalar;
use async_graphql::{SimpleObject, Subscription};
use futures_core::stream::Stream;

#[derive(SimpleObject, Clone, Default)]
pub struct PositionMapPayload {
    pub edit_by: i32,
    pub frame: PosDataScalar,
}

#[derive(Default)]
pub struct PositionMapSubscription;

#[Subscription]
impl PositionMapSubscription {
    async fn position_map_subscription(&self) -> impl Stream<Item = PositionMapPayload> {
        Subscriptor::<PositionMapPayload>::subscribe()
    }
}
