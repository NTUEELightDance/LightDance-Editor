//! Subscriptions for the GraphQL API.

pub mod color;
pub mod position_map;
pub mod position_record;
pub mod control_record;
pub mod control_map;

use color::*;
use position_map::*;
use position_record::*;
use control_record::*;
use control_map::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(
  ColorSubscription,
  ControlRecordSubscription,
  ControlMapSubscription,
  PositionMapSubscription,
  PositionRecordSubscription,
);
