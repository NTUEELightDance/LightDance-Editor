#[cfg(test)]
mod combined_mutation_tests {
    use editor_server::build_graphql;
    use async_graphql::Response;

    #[tokio::test]
    async fn test_add_model_part_and_led() {
        let schema = build_graphql().await;
        let model_name = "NewModel";
        let mutation = format!(
            r#"
            mutation {{
                addModel(input: {{ name: "{}" }}) {{
                    ok
                    msg
                }}
            }}
            "#,
            model_name
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
                    name: "{}",
                    partType: {},
                    modelName: "{}",
                    length: {} 
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
            "#,
            part_name, part_type, model_name, length
        );
        let response: Response = schema.execute(mutation).await;
        assert!(response.is_ok());
        let effect_name = "NewLEDEffect";
        let mutation = format!(
            r#"
            mutation {{
                addLEDEffect(input: {{
                    name: "{}",
                    modelName: "{}",
                    partName: "{}",
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
            "#,
            effect_name, model_name, part_name
        );
        let response: Response = schema.execute(mutation).await;
        assert!(response.is_ok());
    }
}