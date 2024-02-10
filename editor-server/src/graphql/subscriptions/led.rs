//! Color subscription methods.

use crate::graphql::{subscriptor::Subscriptor, types::led::LEDEffectData};
use async_graphql::{SimpleObject, Subscription};
use futures_core::stream::Stream;

#[derive(SimpleObject, Clone, Default)]
#[graphql(name = "LEDPayload")]
pub struct LEDPayload {
    pub create_effects: Vec<LEDEffectData>,
    pub update_effects: Vec<LEDEffectData>,
    pub delete_effects: Vec<i32>,
}

#[derive(Default)]
pub struct LEDSubscription;

#[Subscription]
impl LEDSubscription {
    async fn led_record_subscription(&self) -> impl Stream<Item = LEDPayload> {
        Subscriptor::<LEDPayload>::subscribe()
    }
}
