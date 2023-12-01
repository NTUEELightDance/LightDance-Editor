use crate::db::types::user::UserData;
use crate::global::APP_CLIENTS;
use crate::types::global::UserContext;

/// Callbak for websocket connection
/// A user context is returned if the connection is successful
/// The context will be used to clean up the database when the connection is closed
pub async fn ws_on_connect(_connection_params: serde_json::Value) -> Result<UserContext, String> {
    // Use test user in development
    #[cfg(debug_assertions)]
    {
        let app_state = APP_CLIENTS.get().unwrap().clone();
        let mysql_pool = app_state.mysql_pool();

        let test_user = sqlx::query_as!(
            UserData,
            r#"
                SELECT * FROM User ORDER BY id LIMIT 1;
            "#,
        )
        .fetch_one(mysql_pool)
        .await;

        if let Ok(test_user) = test_user {
            Ok(UserContext {
                username: test_user.name,
                user_id: test_user.id,
                app_state,
            })
        } else {
            Err("No test user found".to_string())
        }
    }

    #[cfg(not(debug_assertions))]
    {
        let token = match connection_params.get("token") {
            Some(token) => token.as_str(),
            None => return Err("No token".to_string()),
        };
        #[allow(unused)]
        let token = match token {
            Some(token) => token.to_string(),
            None => return Err("No token".to_string()),
        };

        // TODO: check token in redis and set editing
        Err("Not implemented".to_string())
    }
}

/// Callback for websocket disconnection
/// The user context is used to clean up the database
pub async fn ws_on_disconnect(context: UserContext) {
    let app_state = context.app_state;

    let mysql = app_state.mysql_pool();
    let _redis = app_state.redis_client();

    let user_id = context.user_id;

    let _ = sqlx::query!(
        r#"
            UPDATE EditingControlFrame SET frame_id = NULL
            WHERE user_id = ?;
        "#,
        user_id
    )
    .execute(mysql)
    .await;

    let _ = sqlx::query!(
        r#"
            UPDATE EditingPositionFrame SET frame_id = NULL
            WHERE user_id = ?;
        "#,
        user_id
    )
    .execute(mysql)
    .await;

    let _ = sqlx::query!(
        r#"
            UPDATE EditingLEDEffect SET led_effect_id = NULL
            WHERE user_id = ?;
        "#,
        user_id
    )
    .execute(mysql)
    .await;
}
