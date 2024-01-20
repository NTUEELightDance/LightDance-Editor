// ! Dancer data types.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Deserialize, Serialize, Default, Debug, Clone)]
pub struct DancerData {
    pub id: i32,
    pub name: String,
}
