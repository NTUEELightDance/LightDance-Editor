use crate::types::global::DBRevision;

use uuid::Uuid;

pub async fn update_revision(mysql: &sqlx::MySqlPool) -> Result<(), sqlx::Error> {
    let uuid = Uuid::new_v4();

    sqlx::query!(
        r#"
            INSERT INTO Revision (uuid)
            VALUES (?);
        "#,
        uuid.to_string(),
    )
    .execute(mysql)
    .await?;

    Ok(())
}

pub async fn get_revision(mysql: &sqlx::MySqlPool) -> Result<DBRevision, sqlx::Error> {
    let revision = sqlx::query!(
        r#"
            SELECT uuid, time
            FROM Revision
            ORDER BY time DESC;
        "#
    )
    .fetch_one(mysql)
    .await?;

    Ok(DBRevision {
        uuid: revision.uuid,
        time: revision.time.to_string(),
    })
}
