//! PositionMap query methods

use crate::graphql::types::map::{MapID, PositionMap, PositionMapScalar};
use crate::types::global::RedisPosition;
use crate::types::global::UserContext;
use crate::utils::data::get_redis_position;
use async_graphql::{Context, InputObject, Object, Result as GQLResult};
use std::collections::HashMap;

#[derive(InputObject, Default)]
pub struct QueryMapInput {
    pub frame_ids: Vec<MapID>,
}

#[derive(Default)]
pub struct PositionMapQuery;

#[Object]
impl PositionMapQuery {
    #[graphql(name = "PosMap")]
    async fn pos_map(
        &self,
        ctx: &Context<'_>,
        select: Option<QueryMapInput>,
    ) -> GQLResult<PositionMap> {
        let context = ctx.data::<UserContext>()?;
        let clients = &context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        match select {
            Some(select) => {
                let frame_ids: Vec<MapID> = select.frame_ids.into_iter().collect();

                let mut result: HashMap<String, RedisPosition> = HashMap::new();
                for frame_id in frame_ids {
                    result.insert(
                        frame_id.id.to_string(),
                        get_redis_position(redis, frame_id.id).await?,
                    );
                }
                Ok(PositionMap {
                    frame_ids: PositionMapScalar(result),
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

                let mut result: HashMap<String, RedisPosition> = HashMap::new();
                for frame_id in all_frame_ids {
                    result.insert(
                        frame_id.id.to_string(),
                        get_redis_position(redis, frame_id.id).await?,
                    );
                }

                Ok(PositionMap {
                    frame_ids: PositionMapScalar(result),
                })
            }
        }
    }
}
