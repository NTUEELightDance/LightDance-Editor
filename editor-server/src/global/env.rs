//! Environment type.

use once_cell::sync::OnceCell;

static APP_ENV: OnceCell<String> = OnceCell::new();

/// Set the environment type in global env
pub fn set(env: String) -> Result<(), String> {
    APP_ENV.set(env)
}

/// Get the environment type from global env
pub fn get<'a>() -> Result<&'a String, &'static str> {
    APP_ENV.get().ok_or("env not initialized")
}
