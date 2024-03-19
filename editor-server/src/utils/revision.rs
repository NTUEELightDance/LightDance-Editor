use crate::types::global::DBRevision;

use uuid::Uuid;

pub async fn update_revision<'e, 'c, E>(executor: E) -> Result<(), sqlx::Error>
where
    'c: 'e,
    E: sqlx::Executor<'c, Database = sqlx::MySql>,
{
    let uuid = Uuid::new_v4();

    sqlx::query!(
        r#"
            INSERT INTO Revision (uuid)
            VALUES (?);
        "#,
        uuid.to_string(),
    )
    .execute(executor)
    .await?;

    Ok(())
}

pub async fn get_revision<'e, 'c, E>(executor: E) -> Result<DBRevision, sqlx::Error>
where
    'c: 'e,
    E: sqlx::Executor<'c, Database = sqlx::MySql>,
{
    let revision = sqlx::query!(
        r#"
            SELECT uuid, time
            FROM Revision
            ORDER BY time DESC;
        "#
    )
    .fetch_one(executor)
    .await?;

    Ok(DBRevision {
        uuid: revision.uuid,
        time: revision.time.to_string(),
    })
}
