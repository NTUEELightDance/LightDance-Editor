#[cfg(test)]
mod position_map_test {
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use editor_server::build_app;
    use tower::{Service, ServiceExt};

    #[tokio::test]
    async fn test_edit_position_map() {
        let mut app = build_app().await;
        let mutation = r#"
            mutation {
                editPositionMap(input: { frameId: 123, positionData: [[0.0, 1.0, 2.0], [1.0, 2.0, 3.0]] }) {
                    frameIds
                }
            }
        "#;

        let boundary = "----test-boundary";
        let multipart_body = format!(
            "--{boundary}\r\n\
            Content-Disposition: form-data; name=\"graphql\"; filename=\"position_frame_test.graphql\"\r\n\
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
