//! Subscriptions for the GraphQL API.

pub mod color;
pub mod control_map;
pub mod control_record;
pub mod led;
pub mod position_map;
pub mod position_record;

use color::*;
use control_map::*;
use control_record::*;
use led::*;
use position_map::*;
use position_record::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(
    ColorSubscription,
    ControlRecordSubscription,
    ControlMapSubscription,
    PositionMapSubscription,
    PositionRecordSubscription,
    LEDSubscription,
);
