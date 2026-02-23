#[cfg(test)]
mod graphql_tests {
    use tokio::sync::OnceCell;

    use editor_server::build_graphql;
    use editor_server::graphql::schema::AppSchema;

    static SCHEMA: OnceCell<AppSchema> = OnceCell::const_new();

    pub async fn get_schema() -> &'static AppSchema {
        SCHEMA.get_or_init(build_graphql).await
    }

    #[tokio::test]
    pub async fn test_add_position_frame() {
        let schema = get_schema().await;
        let start_time = 142;
        let position_data = vec![
            vec![1.0, 2.0, 3.0, 0.1, 0.2, 0.3],
            // vec![4.0, 5.0, 6.0, 0.4, 0.5, 0.6],
            // vec![7.0, 8.0, 9.0, 0.7, 0.8, 0.9],
            // vec![1.0, 2.0, 3.0, 0.1, 0.2, 0.3],
        ];
        // let has_effect = [true, true, true, true];
        let has_position = [true];

        let mutation = format!(
            r#"
            mutation {{
                addPositionFrame(input: {{ start: {}, positionData: {:?} hasPosition: {:?} }}) {{
                    id
                    start
                }}
            }}
            "#,
            start_time, position_data, has_position,
        );

        let data = schema.execute(mutation).await;

        println!("{data:?}");

        assert!(data.is_ok());
    }

    // #[tokio::test]
    // pub async fn test_add_control_frame() {
    //     let schema = get_schema().await;
    //     let start_time = 142;
    //     let control_data = [[
    //         [-1, 255],
    //         [-1, 255],
    //         [-1, 255],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 1],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //         [-1, 0],
    //     ]];
    //
    //     let led_control_data: Vec<Vec<Vec<Vec<i32>>>> = vec![vec![
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //         vec![],
    //     ]];
    //     let has_effect = [true];
    //     let fade = [true];
    //
    //     let mutation = format!(
    //         r#"
    //         mutation {{
    //             addControlFrame(input: {{ start: {}, controlData: {:?} ledControlData: {:?}, hasEffect: {:?}, fade: {:?} }})
    //         }}
    //         "#,
    //         start_time, control_data, led_control_data, has_effect, fade,
    //     );
    //
    //     let data = schema.execute(mutation).await;
    //
    //     println!("{data:?}");
    //
    //     assert!(data.is_ok());
    // }
}
