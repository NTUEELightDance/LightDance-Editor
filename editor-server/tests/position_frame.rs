#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn test_add_position_frame() {
        let schema = build_graphql().await;
        let start_time = 142;
        let position_data = vec![
            vec![1.0, 2.0, 3.0, 0.1, 0.2, 0.3],
            vec![4.0, 5.0, 6.0, 0.4, 0.5, 0.6],
            vec![7.0, 8.0, 9.0, 0.7, 0.8, 0.9],
            vec![1.0, 2.0, 3.0, 0.1, 0.2, 0.3],
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
        );

        let data = schema.execute(mutation).await;

        println!("{data:?}");

        assert!(data.is_ok());
    }
}
