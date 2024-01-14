//! Subscriptions for the GraphQL API.

pub mod color;
pub mod position_map;
pub mod position_record;

use color::*;
use position_map::*;
use position_record::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(
    ColorSubscription,
    PositionMapSubscription,
    PositionRecordSubscription,
);
