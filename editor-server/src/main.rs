use editor_server::build_app;

#[tokio::main(flavor = "multi_thread", worker_threads = 20)]
pub async fn main() {
    // Build server
    let app = build_app().await;

    let server_port: u16 = option_env!("SERVER_PORT")
        .unwrap_or("4000")
        .parse()
        .unwrap();
  
    let listener = TcpListener::bind(SocketAddr::from(([0, 0, 0, 0], server_port)))
      .await
      .expect("Failed to bind to address");

    println!("GraphiQL: http://localhost:{}/graphql", server_port);
    println!("Server listening on port {}", server_port);

    axum::serve(listener, app).await.unwrap();
}
