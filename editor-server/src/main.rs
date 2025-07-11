use editor_server::build_app;

#[tokio::main(flavor = "multi_thread", worker_threads = 20)]
pub async fn main() {
    // Build server
    let app = build_app().await;

    let server_port = option_env!("SERVER_PORT").unwrap_or("4000");

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{server_port}"))
        .await
        .expect("Failed to bind to address");

    println!("GraphiQL: http://localhost:{server_port}/graphql");
    println!("Server listening on port {server_port}");

    axum::serve(listener, app).await.unwrap();
}
