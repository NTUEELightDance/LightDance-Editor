#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn test_add_position_frame() {
        let schema = build_graphql().await;
        let start_time = 101;
        let position_data = vec![
            vec![1.0, 2.0, 3.0],
            vec![4.0, 5.0, 6.0],
            vec![7.0, 8.0, 9.0],
        ];

        let mutation = format!(
            r#"
            mutation {{
                addPositionFrame(start: {start_time}, positionData: {position_data:?}) {{
                    id
                    start
                }}
            }}
            "#,
            start_time = start_time,
            position_data = position_data,
        );

        let data = schema.execute(mutation).await;

        assert!(data.is_ok());
    }
}
