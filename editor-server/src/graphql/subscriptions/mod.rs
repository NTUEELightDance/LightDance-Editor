//! Subscriptions for the GraphQL API.
pub mod color;
pub mod led;

use color::*;
use led::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(ColorSubscription, LEDSubscription);
