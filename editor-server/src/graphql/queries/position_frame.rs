//! PositionFrame query methods

use crate::db::types::position_frame::PositionFrameData;
use crate::types::global::UserContext;
use async_graphql::{Context, Object, Result as GQLResult};

#[derive(Default)]
pub struct ID {
    pub id: i32,
}

#[derive(Default)]
pub struct PositionFrameQuery;

#[Object]
impl PositionFrameQuery {
    async fn position_frame(
        &self,
        ctx: &Context<'_>,
        frame_id: i32,
    ) -> GQLResult<PositionFrameData> {
        let context = ctx.data::<UserContext>()?;
        let clients = &context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        tracing::info!("Query: positionFrame");

        let frame = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE PositionFrame.id = ?;
            "#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        match frame {
            Some(frame) => Ok(frame),
            None => Err(format!("frame id {frame_id} not found").into()),
        }
    }

    #[graphql(name = "positionFrameIDs")]
    async fn position_frame_ids(&self, ctx: &Context<'_>) -> GQLResult<Vec<i32>> {
        let context = ctx.data::<UserContext>()?;
        let clients = &context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        let ids = sqlx::query_as!(
            ID,
            r#"
                SELECT id FROM PositionFrame
                ORDER BY start ASC;
            "#
        )
        .fetch_all(mysql)
        .await?
        .into_iter()
        .map(|data| data.id)
        .collect();

        Ok(ids)
    }
}
