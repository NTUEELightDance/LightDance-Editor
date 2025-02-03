//! Websocket connection callbacks.
//! The callbacks are used to authenticate user when a connection is established.
//! and clean up the database when a connection is closed.

use crate::global;
use crate::types::global::UserContext;
use crate::utils::authentication::verify_token;

/// Callback for websocket connection
/// A user context is returned if the connection is successful
/// The context will be used to clean up the database when the connection is closed
pub async fn ws_on_connect(_connection_params: serde_json::Value) -> Result<UserContext, String> {
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
