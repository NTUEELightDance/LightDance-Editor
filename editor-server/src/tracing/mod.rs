use crate::global;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub fn init_tracing(server_port: u16) {
    let env_type = &global::envs::get().env;

    if env_type == "development" {
        tracing_subscriber::registry()
            .with(
                tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                    format!("{}=debug,tower_http=debug", env!("CARGO_CRATE_NAME")).into()
                }),
            )
            .with(tracing_subscriber::fmt::layer())
            .init();

        tracing::debug!("Listening on port {}", server_port);
    } else {
        println!("Listening on port {}", server_port);
    }
}
