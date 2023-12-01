use crate::graphql::subscriptor::Subscriptor;

use async_graphql::{Enum, SimpleObject, Subscription};
use futures_core::stream::Stream;
use serde::{Deserialize, Serialize};

#[derive(Enum, Clone, Copy, Eq, PartialEq, Default, Serialize, Deserialize)]
pub enum ColorMutationMode {
    #[default]
    #[serde(rename = "UPDATED")]
    Updated,
    #[serde(rename = "CREATED")]
    Created,
    #[serde(rename = "DELETED")]
    Deleted,
}

#[derive(SimpleObject, Clone, Default)]
pub struct ColorPayload {
    pub mutation: ColorMutationMode,
    pub id: i32,
    pub color: Option<String>,
    pub color_code: Option<Vec<i32>>,
    pub edit_by: i32,
}

#[derive(Default)]
pub struct ColorSubscription;

#[Subscription]
impl ColorSubscription {
    async fn color_subscription(&self) -> impl Stream<Item = ColorPayload> {
        Subscriptor::<ColorPayload>::subscribe()
    }
}
