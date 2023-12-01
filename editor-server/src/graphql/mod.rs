pub(crate) mod schema;
pub(crate) mod subscriptor;
pub(crate) mod types;

mod mutations;
mod queries;
mod subscriptions;

use mutations::*;
use queries::*;
use subscriptions::*;
