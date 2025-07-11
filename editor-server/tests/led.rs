#[cfg(test)]
mod combined_mutation_tests {
    use async_graphql::Response;
    use editor_server::build_graphql;

    #[tokio::test]
    async fn test_add_model_part_and_led() {
        let schema = build_graphql().await;
        let model_name = "NewModel";
        let mutation = format!(
            r#"
            mutation {{
                addModel(input: {{ name: "{model_name}" }}) {{
                    ok
                    msg
                }}
            }}
            "#
        );
        let response: Response = schema.execute(mutation).await;
        assert!(response.is_ok());
        let part_name = "NewLEDPart";
        let part_type = "LED";
        let length = 50;
        let mutation = format!(
            r#"
            mutation {{
                addPart(input: {{
                    name: "{part_name}",
                    partType: {part_type},
                    modelName: "{model_name}",
                    length: {length} 
                }}) {{
                    ok
                    msg
                    partData {{
                        id
                        modelId
                        name
                        type
                        length
                    }}
                }}
            }}
            "#
        );
        let response: Response = schema.execute(mutation).await;
        assert!(response.is_ok());
        let effect_name = "NewLEDEffect";
        let mutation = format!(
            r#"
            mutation {{
                addLEDEffect(input: {{
                    name: "{effect_name}",
                    modelName: "{model_name}",
                    partName: "{part_name}",
                    repeat: 1,
                    frames: [{{
                        leds: [[1, 255], [2, 128]],
                        fade: true,
                        start: 100
                    }}]
                }}) {{
                    ok
                    msg
                }}
            }}
            "#
        );
        let response: Response = schema.execute(mutation).await;
        assert!(response.is_ok());
    }
}
