//! ControlFrame query methods

// import type definition
use crate::graphql::types::control_frame::ControlFrame;
use crate::types::global::UserContext;

// import async_graphql
use async_graphql::{Context, Object, Result as GQLResult};
#[derive(Default)]
pub struct ControlFrameQuery;

#[Object]
impl ControlFrameQuery {
    async fn control_frame(&self, ctx: &Context<'_>, frame_id: i32) -> GQLResult<ControlFrame> {
        // get the context and the clients
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        // query the database with the given frame_id
        let result = sqlx::query_as!(
            ControlFrame,
            r#"
                SELECT id, start, fade as "fade: bool"
                FROM ControlFrame 
                WHERE id = ?;
            "#,
            frame_id
        )
        .fetch_one(mysql)
        .await?;

        // return the result
        Ok(ControlFrame {
            id: result.id,
            start: result.start,
            fade: result.fade,
        })
    }

    async fn control_frame_ids(&self, ctx: &Context<'_>) -> GQLResult<Vec<i32>> {
        // get the context and the clients
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        // query the database
        let result = sqlx::query!(
            r#"
                SELECT id FROM ControlFrame;
            "#,
        )
        .fetch_all(mysql)
        .await?
        .into_iter() // convert into an iterator
        .map(|data| data.id) // transform each element into a i32
        .collect(); // collect into a Vec<i32>

        Ok(result)
    }
}
