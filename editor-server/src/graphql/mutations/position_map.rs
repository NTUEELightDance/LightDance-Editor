//! PositionMap mutation methods.

use crate::db::types::{
    dancer::DancerData, editing_position_frame::EditingPositionFrameData,
    position_frame::PositionFrameData,
};
use crate::graphql::subscriptions::position_map::PositionMapPayload;
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::{
    map::{MapID, PositionMap, PositionMapScalar},
    pos_data::{FrameData, PosDataScalar},
};
use crate::types::global::RedisPosition;
use crate::types::global::UserContext;
use crate::utils::data::{get_redis_position, update_redis_position};
use crate::utils::revision::update_revision;

use async_graphql::{Context, InputObject, Object, Result as GQLResult};
use std::collections::HashMap;

#[derive(InputObject, Default)]
pub struct EditPositionMapInput {
    pub frame_id: i32,
    pub position_data: Vec<Vec<f64>>,
    pub has_effect: Vec<bool>,
}

#[derive(Default)]
pub struct PositionMapMutation;

#[Object]
impl PositionMapMutation {
    async fn edit_position_map(
        &self,
        ctx: &Context<'_>,
        input: EditPositionMapInput,
    ) -> GQLResult<PositionMap> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: editPosMap");

        let mut tx = mysql.begin().await?;

        //check payload correctness
        let frame_to_edit = sqlx::query_as!(
            PositionFrameData,
            r#"
            	SELECT * FROM PositionFrame
            	WHERE id = ?;
          	"#,
            input.frame_id
        )
        .fetch_one(&mut *tx)
        .await?;

        let editing = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
            	SELECT * FROM EditingPositionFrame
            	WHERE frame_id = ?;
          	"#,
            frame_to_edit.id
        )
        .fetch_optional(&mut *tx)
        .await?;

        // to check if the frame is editing by other user
        if let Some(editing) = editing {
            if editing.user_id != context.user_id {
                return Err(format!("The frame is now editing by {}", editing.user_id).into());
            }
        }

        let dancers = sqlx::query_as!(
            DancerData,
            r#"
            	SELECT * FROM Dancer
            	ORDER BY id ASC;
          	"#
        )
        .fetch_all(&mut *tx)
        .await?;

        if input.has_effect.len() != input.position_data.len() {
            return Err(format!(
                "Position data and has_effect have difference length. Position data length: {}, has_effect length: {}",
                input.position_data.len(),
                input.has_effect.len(),
            )
            .into());
        }

        if input.position_data.len() != dancers.len() {
            return Err(format!(
                "Not all dancers in payload. Missing number: {}",
                dancers.len() as i32 - input.position_data.len() as i32
            )
            .into());
        }

        let mut errors = Vec::<String>::new();

        // check input correctness
        for (idx, coor) in input.position_data.iter().enumerate() {
            // 6 elements: [x, y, z, rx, ry, rz]
            if coor.len() != 6 {
                errors.push(format!(
                    "Dancer #{} data must have 6 elements [x, y, z, rx, ry, rz]. Got: {}",
                    idx + 1,
                    coor.len()
                ));
                continue;
            }
        }
        if !errors.is_empty() {
            return Err(errors.join("; ").into());
        }

        // update editing position data
        for (idx, coor) in input.position_data.iter().enumerate() {
            let dancer = &dancers[idx];

            if !input.has_effect[idx] {
                let _ = sqlx::query!(
                    r#"
                        UPDATE PositionData
                        SET type = ?, x = NULL, y = NULL, z = NULL, rx = 0, ry = 0, rz = 0
                        WHERE dancer_id = ? AND frame_id = ?;
                    "#,
                    "NO_EFFECT",
                    dancer.id,
                    frame_to_edit.id
                )
                .execute(&mut *tx)
                .await?;
            } else {
                let _ = sqlx::query!(
                    r#"
                        UPDATE PositionData
                        SET type = ?, x = ?, y = ?, z = ?, rx = ?, ry = ?, rz = ?
                        WHERE dancer_id = ? AND frame_id = ?;
                    "#,
                    "POSITION",
                    coor[0],
                    coor[1],
                    coor[2],
                    coor[3],
                    coor[4],
                    coor[5],
                    dancer.id,
                    frame_to_edit.id
                )
                .execute(&mut *tx)
                .await?;
            }
        }

        // update editing position frame
        let _ = sqlx::query!(
            r#"
            	UPDATE EditingPositionFrame
            	SET frame_id = NULL
            	WHERE user_id = ?;
          	"#,
            context.user_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        update_redis_position(mysql, redis, frame_to_edit.id).await?;
        let redis_position = get_redis_position(redis, frame_to_edit.id).await?;
        let update_frames = HashMap::from([(frame_to_edit.id.to_string(), redis_position)]);

        // subscription
        let payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_frames: HashMap::new(),
                delete_frames: vec![],
                update_frames,
            }),
        };

        Subscriptor::publish(payload);

        let frame_ids = sqlx::query_as!(
            MapID,
            r#"
            	SELECT id FROM PositionFrame;
          	"#
        )
        .fetch_all(mysql)
        .await?;
        let mut result: HashMap<String, RedisPosition> = HashMap::new();
        for frame_id in frame_ids {
            result.insert(
                frame_id.id.to_string(),
                get_redis_position(redis, frame_id.id).await?,
            );
        }

        update_revision(mysql).await?;

        Ok(PositionMap {
            frame_ids: PositionMapScalar(result),
        })
    }
}
