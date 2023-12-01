//! Database clients.

use crate::db::clients::AppClients;

use once_cell::sync::OnceCell;
use std::sync::Arc;

static APP_CLIENTS: OnceCell<Arc<AppClients>> = OnceCell::new();

/// Set the database clients in global clients
pub fn set(clients: Arc<AppClients>) -> Result<(), Arc<AppClients>> {
    APP_CLIENTS.set(clients)
}

/// Get the database clients from global clients
pub fn get<'a>() -> Result<&'a Arc<AppClients>, &'static str> {
    APP_CLIENTS.get().ok_or("clients not initialized")
}
