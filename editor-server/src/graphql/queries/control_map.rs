//! ControlMap query methods

// import types
use crate::graphql::types::map::{ControlMap, ControlMapScalar};
use crate::types::global::RedisControl;
use crate::types::global::UserContext;
use crate::utils::data::get_redis_control;
use std::collections::HashMap;

// import modules and functions
use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct QueryMapInput {
    frame_ids: Option<Vec<i32>>,
}

// helper function
async fn get_all_frame_ids(ctx: &Context<'_>) -> GQLResult<Vec<i32>> {
    // get context and  clients
    let context = ctx.data::<UserContext>()?;
    let clients = context.clients;
    let mysql = clients.mysql_pool();

    // query all frame ids
    let result = sqlx::query!(
        r#"
          SELECT id FROM ControlFrame;
        "#
    )
    .fetch_all(mysql)
    .await?;

    let frame_ids: Vec<i32> = result.iter().map(|row| row.id).collect();

    return Ok(frame_ids);
}

// Query methods
#[derive(Default)]
pub struct ControlMapQuery;

#[Object]
impl ControlMapQuery {
    async fn control_map(
        &self,
        ctx: &Context<'_>,
        select: Option<QueryMapInput>,
    ) -> GQLResult<ControlMap> {
        let context = ctx.data::<UserContext>()?;
        let clients = &context.clients;
        let redis = clients.redis_client();

        // if "select" or frame_ids are not provided, return all control frame ids
        // if "select" and frame_ids are provided, return the frame ids specified
        let frame_ids = match select {
            Some(select) => match select.frame_ids {
                Some(frame_ids) => frame_ids,
                None => get_all_frame_ids(ctx).await?,
            },
            None => get_all_frame_ids(ctx).await?,
        };

        // get redis control data for each frame id
        let mut result: HashMap<String, RedisControl> = HashMap::new();
        for frame_id in frame_ids {
            result.insert(
                frame_id.to_string(),
                get_redis_control(redis, frame_id).await?,
            );
        }

        // return the result
        Ok(ControlMap {
            frame_ids: ControlMapScalar(result),
        })
    }
}
