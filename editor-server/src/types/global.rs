use crate::db::clients::AppClients;

use std::sync::Arc;

#[derive(Debug)]
pub struct UserContext {
    pub username: String,
    pub user_id: i32,
    pub app_state: Arc<AppClients>,
}
