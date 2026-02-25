//! Environment variables

use load_dotenv::load_dotenv;
use once_cell::sync::OnceCell;

#[derive(Debug)]
pub struct Env {
    pub env: String,
    pub redis_ctrl_prefix: String,
    pub redis_pos_prefix: String,
}

static ENV: OnceCell<Env> = OnceCell::new();

pub fn set() {
    if ENV.get().is_some() {
        return;
    }

    load_dotenv!();
    let env = env!("ENV").to_string();
    let redis_ctrl_prefix = env!("REDIS_CTRL_PREFIX").to_string();
    let redis_pos_prefix = env!("REDIS_POS_PREFIX").to_string();

    ENV.set(Env {
        env,
        redis_ctrl_prefix,
        redis_pos_prefix,
    })
    .unwrap();
}

pub fn get() -> &'static Env {
    ENV.get().expect("ENV not set")
}
