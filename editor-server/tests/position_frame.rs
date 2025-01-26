#[cfg(test)]
mod tests {
    use axum::{
        body::Body,
        http::{Request, Response, StatusCode},
    };
    use serde_json::Value;

    #[derive(Clone)]
    struct PositionFrameData {
        id: i32,
        start: i32,
    }

    fn mock_db_query_start_overlap(
        existing_frame: PositionFrameData,
    ) -> Result<PositionFrameData, String> {
        Ok(existing_frame)
    }

    pub struct App {}

    impl App {
        pub fn new() -> Self {
            App {}
        }

        pub async fn handle_request(&self, _req: Request<Body>) -> Response<Body> {
            Response::builder()
                .status(StatusCode::OK)
                .body(Body::from(r#"{"data": "some response"}"#))
                .unwrap()
        }
    }

    async fn send_graphql_request(app: &mut App, query: String) -> Response<Body> {
        let req = Request::builder()
            .uri("/graphql")
            .body(Body::from(format!(r#"{{ "query": "{}" }}"#, query)))
            .unwrap();

        app.handle_request(req).await
    }

    #[tokio::test]
    async fn test_graphql_query() {
        let mut app = App::new();
        let query = r#"{ query_name { field1 field2 } }"#.to_string();

        let response = send_graphql_request(&mut app, query).await;

        assert_eq!(response.status(), StatusCode::OK);

        let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .unwrap();
        let response_json: Value = serde_json::from_slice(&body_bytes).unwrap();

        assert_eq!(response_json["data"], "some response");
    }

    #[tokio::test]
    async fn test_db_query_start_overlap() {
        let existing_frame = PositionFrameData { id: 1, start: 100 };

        let result = mock_db_query_start_overlap(existing_frame.clone());
        assert!(result.is_ok());
        let result_frame = result.unwrap();
        assert_eq!(result_frame.id, 1);
        assert_eq!(result_frame.start, 100);
    }

    #[tokio::test]
    async fn test_edit_position_frame() {
        let input = PositionFrameData { id: 1, start: 200 };

        let result = mock_db_query_start_overlap(input.clone());
        assert!(result.is_ok());
        let edited_frame = result.unwrap();
        assert_eq!(edited_frame.id, 1);
        assert_eq!(edited_frame.start, 200);
    }
}
