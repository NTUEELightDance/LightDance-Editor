//! Websocket connection callbacks.
//! The callbacks are used to authenticate user when a connection is established.
//! and clean up the database when a connection is closed.

use crate::global;
use crate::types::global::UserContext;
use crate::utils::authentication::{get_test_user_context, verify_token};
use std::env::var;

/// Callback for websocket connection
/// A user context is returned if the connection is successful
/// The context will be used to clean up the database when the connection is closed
pub async fn ws_on_connect(_connection_params: serde_json::Value) -> Result<UserContext, String> {
    let user_context = if var("ENV").expect("ENV not set") == "development" {
        get_test_user_context().await
    } else {
        let token = match _connection_params.get("token") {
            Some(token) => token.as_str(),
            None => return Err("No token".to_string()),
        };

        let token = match token {
            Some(token) => token.to_string(),
            None => return Err("No token".to_string()),
        };

        let clients = global::clients::get();
        let user = verify_token(&token).await?;

        Ok(UserContext {
            username: user.name,
            user_id: user.id,
            clients,
        })
    }?;

    let mysql = user_context.clients.mysql_pool();
    let user_id = user_context.user_id;
    let editing_control_frame = sqlx::query!(
        r#"
            SELECT EditingControlFrame.* FROM EditingControlFrame
            WHERE EditingControlFrame.user_id = ?
        "#,
        user_id
    )
    .fetch_optional(mysql)
    .await
    .map_err(|e| e.to_string())?;

    if editing_control_frame.is_none() {
        let _ = sqlx::query!(
            r#"
                INSERT INTO EditingControlFrame (user_id, frame_id)
                VALUES (?, NULL)
            "#,
            user_id
        )
        .execute(mysql)
        .await
        .map_err(|e| e.to_string())?;
    }

    let editing_position_frame = sqlx::query!(
        r#"
            SELECT EditingPositionFrame.* FROM EditingPositionFrame
            WHERE EditingPositionFrame.user_id = ?
        "#,
        user_id
    )
    .fetch_optional(mysql)
    .await
    .map_err(|e| e.to_string())?;

    if editing_position_frame.is_none() {
        let _ = sqlx::query!(
            r#"
                INSERT INTO EditingControlFrame (user_id, frame_id)
                VALUES (?, NULL)
            "#,
            user_id
        )
        .execute(mysql)
        .await
        .map_err(|e| e.to_string())?;
    }

    let editing_led_effect = sqlx::query!(
        r#"
            SELECT EditingLEDEffect.* FROM EditingLEDEffect
            WHERE EditingLEDEffect.user_id = ?
        "#,
        user_id
    )
    .fetch_optional(mysql)
    .await
    .map_err(|e| e.to_string())?;

    if editing_led_effect.is_none() {
        let _ = sqlx::query!(
            r#"
                INSERT INTO EditingLEDEffect (user_id, led_effect_id)
                VALUES (?, NULL)
            "#,
            user_id
        )
        .execute(mysql)
        .await
        .map_err(|e| e.to_string())?;
    }

    Ok(user_context)
}

/// Callback for websocket disconnection
/// The user context is used to clean up the database
pub async fn ws_on_disconnect(context: UserContext) {
    let clients = context.clients;

    let mysql = clients.mysql_pool();
    let _redis = clients.redis_client();

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
