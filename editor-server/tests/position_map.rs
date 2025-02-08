#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    async fn test_edit_position_map() {
        let schema = build_graphql().await;
        let mutation = r#"
            mutation {
                editPositionMap(input: { frameId: 123, positionData: [[0.0, 1.0, 2.0], [1.0, 2.0, 3.0]] }) {
                    frameIds
                }
            }
        "#;
        let data = schema.execute(mutation).await;
        assert!(data.is_ok());
    }
}
