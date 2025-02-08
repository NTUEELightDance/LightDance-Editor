#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn test_edit_position_frame() {
        let schema = build_graphql().await;
        let frame_id = 1;
        let new_start_time = 100;
        let mutation = format!(
            r#"
            mutation {{
                editPositionFrame(input: {{ frameId: {frame_id}, start: {new_start_time} }}) {{
                    id
                    start
                }}
            }}
            "#,
        );
        let data = schema.execute(mutation).await;
        assert!(data.is_ok());
    }
}
