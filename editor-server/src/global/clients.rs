//! Database clients.

use crate::db::clients::AppClients;

use once_cell::sync::OnceCell;

static APP_CLIENTS: OnceCell<AppClients> = OnceCell::new();

/// Set the database clients in global clients
pub fn set(clients: AppClients) {
    if APP_CLIENTS.get().is_some() {
        return;
    }

    APP_CLIENTS.set(clients).unwrap();
}

/// Get the database clients from global clients
pub fn get() -> &'static AppClients {
    APP_CLIENTS.get().expect("clients not initialized")
}
