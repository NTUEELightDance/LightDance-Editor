#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn test_add_position_frame() {
        let schema = build_graphql().await;

        let start_time = 101; // This can be any unique start time you want to test
        let position_data = vec![
            vec![1.0, 2.0, 3.0], // Coordinates for dancer 1
            vec![4.0, 5.0, 6.0], // Coordinates for dancer 2
            vec![7.0, 8.0, 9.0], // Coordinates for dancer 3
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

        // Execute the GraphQL mutation
        let data = schema.execute(mutation).await;

        // Ensure the response is successful
        assert!(data.is_ok());
    }
}
