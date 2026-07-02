#[cfg(test)]
mod graphql_tests {
    use std::env::var;

    use redis::AsyncCommands;
    use tokio::sync::OnceCell;

    use editor_server::db::clients::AppClients;
    use editor_server::global;
    use editor_server::graphql::schema::{build_schema_with_context, AppSchema};
    use editor_server::utils::authentication::get_test_user_context;

    static SCHEMA: OnceCell<AppSchema> = OnceCell::const_new();

    pub async fn get_schema() -> &'static AppSchema {
        SCHEMA.get_or_init(build_test_schema).await
    }

    async fn build_test_schema() -> AppSchema {
        dotenv::dotenv().ok();
        global::envs::set();

        let mysql = Box::leak(var("DATABASE_URL").unwrap().into_boxed_str());
        let redis_host = Box::leak(var("REDIS_HOST").unwrap().into_boxed_str());
        let redis_port = Box::leak(var("REDIS_PORT").unwrap().into_boxed_str());

        global::clients::set(AppClients::connect(mysql, (redis_host, redis_port)).await);

        let user_context = get_test_user_context().await.unwrap();
        build_schema_with_context(user_context).await
    }

    #[tokio::test]
    pub async fn test_add_position_frame() {
        let schema = get_schema().await;
        let mysql = global::clients::get().mysql_pool();
        let start_time = sqlx::query_scalar::<_, Option<i32>>(
            "SELECT COALESCE(MAX(start) + 1, 0) FROM PositionFrame",
        )
        .fetch_one(mysql)
        .await
        .unwrap()
        .unwrap();
        let dancer_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM Dancer")
            .fetch_one(mysql)
            .await
            .unwrap();
        let position_data = (0..dancer_count)
            .map(|idx| {
                let base = idx as f64;
                vec![base + 1.0, base + 2.0, base + 3.0, 0.1, 0.2, 0.3]
            })
            .collect::<Vec<_>>();
        let has_position = vec![true; dancer_count as usize];

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

        let errors = data.errors.clone();
        let created_frame_id =
            sqlx::query_scalar::<_, i32>("SELECT id FROM PositionFrame WHERE start = ?")
                .bind(start_time)
                .fetch_optional(mysql)
                .await
                .unwrap();

        if let Some(frame_id) = created_frame_id {
            let mut redis = global::clients::get()
                .redis_client()
                .get_multiplexed_async_connection()
                .await
                .unwrap();
            let redis_key = format!("{}{}", global::envs::get().redis_pos_prefix, frame_id);
            let _: () = redis.del(redis_key).await.unwrap();

            sqlx::query("DELETE FROM PositionFrame WHERE id = ?")
                .bind(frame_id)
                .execute(mysql)
                .await
                .unwrap();
        }

        assert!(errors.is_empty(), "GraphQL errors: {errors:#?}");
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
