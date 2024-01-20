//! Subscriptions for the GraphQL API.
pub mod color;
pub mod dancer;

use color::*;
use dancer::*;

#[derive(async_graphql::MergedSubscription, Default)]
//pub struct SubscriptionRoot(ColorSubscription);
pub struct SubscriptionRoot(ColorSubscription, DancerSubscription);
