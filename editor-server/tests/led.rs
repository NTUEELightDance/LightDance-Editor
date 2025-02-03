#[cfg(test)]
mod led_effect_test {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use editor_server::build_app;
    use tower::{Service, ServiceExt};

    #[tokio::test]
    async fn test_edit_led_effect() {
        let mut app = build_app().await;

        let mutation = r#"
            mutation {
                editLEDEffect(id: 1, input: { name: "Updated Effect", repeat: 3, frames: [] }) {
                    id
                    effect_name
                    ok
                    msg
                }
            }
        "#;

        let boundary = "----test-boundary";
        let multipart_body = format!(
            "--{boundary}\r\n\
            Content-Disposition: form-data; name=\"graphql\"; filename=\"led_effect_test.graphql\"\r\n\
            Content-Type: application/graphql\r\n\
            \r\n\
            {mutation}\r\n\
            --{boundary}--\r\n",
            boundary = boundary,
            mutation = mutation
        );

        let request = Request::builder()
            .method("POST")
            .uri("/graphql")
            .header(
                "Content-Type",
                format!("multipart/form-data; boundary={boundary}"),
            )
            .body(Body::from(multipart_body))
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
