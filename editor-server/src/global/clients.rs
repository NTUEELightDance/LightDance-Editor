use crate::db::clients::AppClients;

use once_cell::sync::OnceCell;
use std::sync::Arc;

static APP_CLIENTS: OnceCell<Arc<AppClients>> = OnceCell::new();

pub fn set(clients: Arc<AppClients>) -> Result<(), Arc<AppClients>> {
    APP_CLIENTS.set(clients)
}

pub fn get<'a>() -> Result<&'a Arc<AppClients>, &'static str> {
    APP_CLIENTS.get().ok_or("clients not initialized")
}
