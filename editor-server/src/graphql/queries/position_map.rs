//! PositionMap query methods

use crate::graphql::types::map::{MapID, PositionMap, PositionMapScalar};
use crate::types::global::UserContext;
use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct QueryMapInput {
    pub frame_ids: Vec<MapID>,
}

#[derive(Default)]
pub struct PositionMapQuery;

#[Object]
impl PositionMapQuery {
    async fn pos_map(
        &self,
        ctx: &Context<'_>,
        select: Option<QueryMapInput>,
    ) -> GQLResult<PositionMap> {
        let context = ctx.data::<UserContext>()?;
        let clients = &context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        match select {
            Some(select) => {
                let frame_ids: Vec<MapID> = select.frame_ids.into_iter().collect();
                Ok(PositionMap {
                    frame_ids: PositionMapScalar(frame_ids),
                })
            }
            None => {
                let all_frame_ids = sqlx::query_as!(
                    MapID,
                    r#"
                        SELECT id FROM PositionFrame;
                    "#,
                )
                .fetch_all(mysql)
                .await?;

                Ok(PositionMap {
                    frame_ids: PositionMapScalar(all_frame_ids),
                })
            }
        }
    }
}
