#[cfg(test)]
mod false_login_test {

    use editor_server::{build_app, global};

    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::{Service, ServiceExt};

    /// test for login with false username and password
    /// this test requires the presence of a .env file containing necessary information
    /// this test is only nontrivial when run in production mode
    #[tokio::test]
    async fn login_false() {
        dotenv::dotenv().ok();

        let mut app = build_app().await;

        let env_type = &global::envs::get().env;
        if env_type == "development" {
            return;
        }

        let login_data = " { \"username\": \"foo\", \"password\": \"bar\" } ";

        let request = Request::builder()
            .method("POST")
            .uri("/api/login")
            .header("Content-Type", "application/json")
            .body(Body::from(login_data))
            .unwrap();

        let response = ServiceExt::<Request<Body>>::ready(&mut app)
            .await
            .unwrap()
            .call(request)
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::FORBIDDEN);
    }
}
