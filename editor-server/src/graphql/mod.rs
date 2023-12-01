//! GraphQL queries, mutations and subscriptions.

pub mod schema;
pub mod subscriptor;
pub mod types;

mod mutations;
mod queries;
mod subscriptions;

use mutations::*;
use queries::*;
use subscriptions::*;
