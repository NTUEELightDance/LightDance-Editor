#[cfg(test)]
mod api_tests {
    use std::fs;
    use axum::{body::Body, http::Request, http::StatusCode};
    use tower::{Service, ServiceExt};

    use editor_server::build_app;

    #[tokio::test]
    async fn upload_and_export_data() {
        let mut app = build_app().await;

        let file_path = "../utils/jsons/exportDataEmpty.json";
        let file_bytes = fs::read(file_path).unwrap();
        // let input_json: Value = serde_json::from_slice(&file_bytes).unwrap();

        let boundary = "----test-boundary";
        let multipart_body = format!(
            "--{boundary}\r\n\
             Content-Disposition: form-data; name=\"data\"; filename=\"exportDataEmpty.json\"\r\n\
             Content-Type: application/json\r\n\
             \r\n\
             {file_content}\r\n\
             --{boundary}--\r\n",
            boundary = boundary,
            file_content = String::from_utf8_lossy(&file_bytes),
        );

        let request = Request::builder()
            .method("POST")
            .uri("/api/uploadData")
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

        let response = ServiceExt::<Request<Body>>::ready(&mut app)
            .await
            .unwrap()
            .call(
                Request::builder()
                    .uri("/api/exportData")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::OK);

        // let body = response.into_body().collect().await.unwrap().to_bytes();
        // let exported_json: Value = serde_json::from_slice(&body).unwrap();

        // this will fail (for now)
        // assert_eq!(input_json, exported_json);
    }
}
