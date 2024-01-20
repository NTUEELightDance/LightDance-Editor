//! Subscriptions for the GraphQL API.

pub mod color;
pub mod position_map;
pub mod position_record;
pub mod led;

use color::*;
use position_map::*;
use position_record::*;
use led::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(
    ColorSubscription,
    PositionMapSubscription,
    PositionRecordSubscription,
    LEDSubscription
);

