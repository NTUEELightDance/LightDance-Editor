#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn get_color() {
        let schema = build_graphql().await;

        let data = schema
            .execute(
                r#"
                {
                    colorMap {
                        colorMap
                    }
                }
                "#,
            )
            .await;

        assert!(data.is_ok());
    }
}
