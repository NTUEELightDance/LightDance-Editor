#[cfg(test)]
mod auth {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use editor_server::build_app;
    use std::env::var;
    use tower::{Service, ServiceExt};

    /// test for check_token, login, logout functionality
    /// this test requires the presence of a .env file containing necessary information
    /// for successful login, AUTH0_TEST_USERNAME and AUTH0_TEST_PASSWORD must be set in .env
    #[tokio::test]
    async fn auth() {
        dotenv::dotenv().ok();

        let mut app = build_app().await;

        // login
        let username = var("AUTH0_TEST_USERNAME").expect("test username not set");
        let password = var("AUTH0_TEST_PASSWORD").expect("test password not set");

        let login_data =
            format!(" {{ \"username\": \"{username}\", \"password\": \"{password}\" }} ");

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

        println!("{:?}", response.body());

        let cookie = response
            .headers()
            .get("Set-Cookie")
            .unwrap()
            .to_str()
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        // get response from /api/checkToken endpoint
        let request = Request::builder()
            .method("GET")
            .uri("/api/checkToken")
            .header("Content-Type", "application/json")
            .header("Cookie", cookie)
            .body(Body::empty())
            .unwrap();

        let response = ServiceExt::<Request<Body>>::ready(&mut app)
            .await
            .unwrap()
            .call(request)
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        // logout
        let request = Request::builder()
            .method("POST")
            .uri("/api/logout")
            .header("Content-Type", "application/json")
            .header("Cookie", cookie)
            .body(Body::empty())
            .unwrap();

        let response = ServiceExt::<Request<Body>>::ready(&mut app)
            .await
            .unwrap()
            .call(request)
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        // after logout check_token should return NOT_FOUND
        let request = Request::builder()
            .method("GET")
            .uri("/api/checkToken")
            .header("Content-Type", "application/json")
            .header("Cookie", cookie)
            .body(Body::empty())
            .unwrap();

        let response = ServiceExt::<Request<Body>>::ready(&mut app)
            .await
            .unwrap()
            .call(request)
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);

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
