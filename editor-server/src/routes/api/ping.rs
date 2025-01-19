use crate::global;

use axum::{http::StatusCode, response::Json};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct PingResponse {
    uuid: String,
    time: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PingFailedResponse {
    err: String,
}

/// Ping handler.
/// Return current db revision.
pub async fn ping(
) -> Result<(StatusCode, Json<PingResponse>), (StatusCode, Json<PingFailedResponse>)> {
    // Get app state
    let clients = global::clients::get();

    let mysql = clients.mysql_pool();

    let db_revision = sqlx::query!(
        r#"
            SELECT uuid, time
            FROM Revision
            ORDER BY time DESC;
        "#
    )
    .fetch_one(mysql)
    .await
    .map_err(|err| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(PingFailedResponse {
                err: err.to_string(),
            }),
        )
    })?;

    let response = PingResponse {
        uuid: db_revision.uuid,
        time: db_revision.time.to_string(),
    };

    Ok((StatusCode::OK, Json(response)))
}
