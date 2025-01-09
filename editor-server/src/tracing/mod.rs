use std::time::Duration;

use crate::global;
use axum::Router;
use http::{header::CONTENT_LENGTH, Request, Response};
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing::Span;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_tracing(server_port: u16) {
    let env_type = &global::envs::get().env;

    if env_type == "production" {
        println!("Listening on port {}", server_port);
        return;
    }

    tracing_subscriber::registry()
        .with(EnvFilter::new(format!(
            "{}=debug,tower_http=debug",
            env!("CARGO_CRATE_NAME")
        )))
        .with(fmt::layer().without_time().with_target(false).compact())
        .init();

    tracing::debug!("Listening on port {}", server_port);
}

pub fn build_trace_layer(router: Router) -> Router {
    router.layer(
        TraceLayer::new_for_http()
            .make_span_with(DefaultMakeSpan::default())
            .on_request(|_request: &Request<_>, _span: &Span| {})
            .on_response(|response: &Response<_>, latency: Duration, _span: &Span| {
                let content_length = response
                    .headers()
                    .get(CONTENT_LENGTH)
                    .and_then(|value| value.to_str().ok())
                    .unwrap_or("0");

                tracing::debug!(
                    "\x1b[1;32mtime:\x1b[0m {:<10?} \x1b[1;32mstatus:\x1b[0m {:<12} \x1b[1;32msize:\x1b[0m {:<6}",
                    latency,
                    response.status(),
                    content_length
                );
            }),
    )
}
