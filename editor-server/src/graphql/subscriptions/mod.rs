//! Subscriptions for the GraphQL API.

pub mod color;
pub mod led;
pub mod position_map;
pub mod position_record;

use color::*;
use led::*;
use position_map::*;
use position_record::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(
    ColorSubscription,
    PositionMapSubscription,
    PositionRecordSubscription,
    LEDSubscription,
);
