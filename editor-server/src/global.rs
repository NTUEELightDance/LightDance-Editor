use crate::db::clients::AppClients;

use once_cell::sync::OnceCell;
use std::sync::Arc;

pub static APP_CLIENTS: OnceCell<Arc<AppClients>> = OnceCell::new();
