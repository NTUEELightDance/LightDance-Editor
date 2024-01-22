//! Color subscription methods.

use crate::graphql::subscriptor::Subscriptor;

use async_graphql::{ SimpleObject, Subscription};
use futures_core::stream::Stream;

#[derive(SimpleObject, Clone, Default)]
pub struct Frame {
    pub create_list: Vec<i32>, 
    pub delete_list: Vec<i32>,
    pub update_list: Vec<i32>,
}
#[derive(SimpleObject, Clone, Default)]

pub struct ControlMapPayload {
    pub frame: Frame,
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
