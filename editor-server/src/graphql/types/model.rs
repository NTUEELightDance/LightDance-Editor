//! Model type.

use async_graphql::SimpleObject;
use serde::{Deserialize, Serialize};

#[derive(SimpleObject, Serialize, Deserialize, Default, Debug, Clone)]
pub struct Model {
    pub id: i32,
    pub name: String,
    pub dancers: Vec<String>,
}
