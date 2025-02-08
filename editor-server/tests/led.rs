#[cfg(test)]
mod graphql_tests {
    use editor_server::build_graphql;

    #[tokio::test]
    pub async fn edit_led_effect() {
        let schema = build_graphql().await;

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

        let data = schema.execute(mutation).await;

        assert!(data.is_ok());
    }
}
