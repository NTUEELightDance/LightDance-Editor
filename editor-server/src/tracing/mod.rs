use std::time::Duration;

use crate::global;
use axum::Router;
use http::{header::CONTENT_LENGTH, Response};
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing::Span;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

/// Initialize api tracing
pub fn init_tracing() {
    let env_type = &global::envs::get().env;

    if env_type == "production" {
        return;
    }

    tracing_subscriber::registry()
        .with(EnvFilter::new(format!(
            "{}=debug,tower_http=debug",
            env!("CARGO_CRATE_NAME")
        )))
        .with(fmt::layer().without_time().with_target(false).compact())
        .init();
}

/// Trace layer for the api router, logs time, status, and size of response
pub fn build_api_tracer(router: Router) -> Router {
    router.layer(
        TraceLayer::new_for_http()
            .make_span_with(DefaultMakeSpan::default())
            .on_request(())
            .on_response(|response: &Response<_>, latency: Duration, _span: &Span| {
                let content_length = response
                    .headers()
                    .get(CONTENT_LENGTH)
                    .and_then(|value| value.to_str().ok())
                    .unwrap_or("0");

                tracing::info!(
                    "\x1b[1m\x1b[38;2;0;191;255mtime:\x1b[0m {:<10?} \x1b[1m\x1b[38;2;0;191;255mstatus:\x1b[0m {:<12} \x1b[1m\x1b[38;2;0;191;255msize:\x1b[0m {:<6}",
                    latency,
                    response.status(),
                    content_length
                );
            }),
    )
}

/// Trace layer for the graphql router, logs time, status, and size of response
pub fn build_graphql_tracer(router: Router) -> Router {
    router.layer(
        TraceLayer::new_for_http()
            .make_span_with(DefaultMakeSpan::default())
            .on_request(())
            .on_response(|response: &Response<_>, latency: Duration, _span: &Span| {
                let content_length = response
                    .headers()
                    .get(CONTENT_LENGTH)
                    .and_then(|value| value.to_str().ok())
                    .unwrap_or("0");

                tracing::info!(
                    "\x1b[1m\x1b[38;2;225;0;152mtime:\x1b[0m {:<10?} \x1b[1m\x1b[38;2;225;0;152mstatus:\x1b[0m {:<12} \x1b[1m\x1b[38;2;225;0;152msize:\x1b[0m {:<6}",
                    latency,
                    response.status(),
                    content_length
                );
            }),
    )
}
