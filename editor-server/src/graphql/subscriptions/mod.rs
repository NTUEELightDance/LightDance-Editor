pub mod color;

use color::*;

#[derive(async_graphql::MergedSubscription, Default)]
pub struct SubscriptionRoot(ColorSubscription);
