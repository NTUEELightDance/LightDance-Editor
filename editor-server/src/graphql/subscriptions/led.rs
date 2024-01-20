//! Color subscription methods.

use crate::graphql::{subscriptor::Subscriptor, types::led::LEDEffectData};
use async_graphql::{Enum, SimpleObject, Subscription};
use futures_core::stream::Stream;
use serde::{Deserialize, Serialize};

#[derive(Enum, Clone, Copy, Eq, PartialEq, Default, Serialize, Deserialize)]
pub enum LEDMutationMode {
    #[default]
    #[serde(rename = "UPDATED")]
    Updated,
    #[serde(rename = "CREATED")]
    Created,
    #[serde(rename = "DELETED")]
    Deleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct LEDPayload {
    pub mutation: LEDMutationMode,
    pub id: i32,
    pub part_name: String,
    pub effect_name: String,
    pub edit_by: i32,
    pub data: LEDEffectData,
}

#[derive(Default)]
pub struct LEDSubscription;

#[Subscription]
impl LEDSubscription {
    async fn led_record_subscription(&self) -> impl Stream<Item = LEDPayload> {
        Subscriptor::<LEDPayload>::subscribe()
    }
}
