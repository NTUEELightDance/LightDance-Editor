use once_cell::sync::OnceCell;
use std::env::var;

#[derive(Debug)]
pub struct Env {
    pub env: String,
    pub redis_ctrl_prefix: String,
    pub redis_pos_prefix: String,
}

static ENV: OnceCell<Env> = OnceCell::new();

pub fn set() {
    let env = var("ENV").expect("ENV not set");
    let redis_ctrl_prefix = var("REDIS_CTRL_PREFIX").unwrap_or_else(|_| "CTRLFRAME_".to_string());
    let redis_pos_prefix = var("REDIS_POS_PREFIX").unwrap_or_else(|_| "POSFRAME_".to_string());

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
