#[cfg(test)]
mod logout_test {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use editor_server::{build_app, global};
    use std::env::var;
    use tower::{Service, ServiceExt};

    /// test for logout functionality
    /// also tests login functionality
    /// this test requires the presence of a .env file containing necessary information
    /// this test is only nontrivial when run under production mode
    /// for successful login, AUTH0_TEST_USERNAME and AUTH0_TEST_PASSWORD must be set in .env
    #[tokio::test]
    async fn logout() {
        dotenv::dotenv().ok();

        let mut app = build_app().await;

        let env_type = &global::envs::get().env;
        if env_type == "development" {
            return;
        }

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

        let cookie = response
            .headers()
            .get("Set-Cookie")
            .unwrap()
            .to_str()
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

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
    }
}
