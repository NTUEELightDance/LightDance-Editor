use once_cell::sync::OnceCell;

static APP_ENV: OnceCell<String> = OnceCell::new();

pub fn set(env: String) -> Result<(), String> {
    APP_ENV.set(env)
}

pub fn get<'a>() -> Result<&'a String, &'static str> {
    APP_ENV.get().ok_or("env not initialized")
}
