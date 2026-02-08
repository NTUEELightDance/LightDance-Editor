//! PositionFrame mutation methods.

use crate::db::types::{
    dancer::DancerData, editing_position_frame::EditingPositionFrameData,
    position_frame::PositionFrameData,
};
use crate::graphql::position_record::{PositionRecordMutationMode, PositionRecordPayload};
use crate::graphql::subscriptions::position_map::PositionMapPayload;
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::pos_data::{FrameData, PosDataScalar};
use crate::graphql::types::pos_frame::{PositionFrame, PositionFrameRevision};
use crate::types::global::{RedisPosition, Revision, UserContext};
use crate::utils::data::{delete_redis_position, get_redis_position, update_redis_position};
use crate::utils::revision::update_revision;

use async_graphql::{Context, InputObject, Object, Result as GQLResult};
use std::collections::HashMap;

#[derive(InputObject, Default)]
pub struct EditPositionFrameInput {
    pub frame_id: i32,
    pub start: i32,
}

#[derive(InputObject, Default)]
pub struct DeletePositionFrameInput {
    #[graphql(name = "frameID")]
    pub frame_id: i32,
}

#[derive(Default)]
pub struct PositionFrameMutation;

#[Object]
impl PositionFrameMutation {
    async fn add_position_frame(
        &self,
        ctx: &Context<'_>,
        start: i32,
        position_data: Option<Vec<Vec<Option<f64>>>>,
    ) -> GQLResult<PositionFrame> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: addPositionFrame");

        let mut tx = mysql.begin().await?;

        let check = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE start = ?;
            "#,
            start
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(check) = check {
            return Err(format!(
                "Start Time {} overlapped! (Overlapped frameID: {})",
                start, check.id
            )
            .into());
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

        // type constants
        const NO_EFFECT: i32 = 0;
        const POSITION: i32 = 1;

        if let Some(data) = &position_data {
            if (*data).len() != dancers.len() {
                return Err(format!(
                    "Not all dancers in payload. Missing number: {}",
                    dancers.len() as i32 - (*data).len() as i32,
                )
                .into());
            }
            let mut errors = Vec::<String>::new();

            for (idx, coor) in (*data).iter().enumerate() {
                // 7 elements: [type, x, y, z, rx, ry, rz]
                if coor.len() != 7 {
                    errors.push(format!(
                        "Dancer #{} data must have 7 elements [type, x, y, z, rx, ry, rz]. Got: {}",
                        idx + 1,
                        coor.len()
                    ));
                    continue;
                }

                let type_value = coor[0].unwrap_or(-1_f64) as i32;

                // validate type value
                if type_value != NO_EFFECT && type_value != POSITION {
                    errors.push(format!(
                        "Invalid type value {} for dancer #{}. Must be 0 (NO_EFFECT) or 1 (POSITION).",
                        type_value,
                        idx + 1
                    ));
                }
            }
            if !errors.is_empty() {
                return Err(errors.join("\n").into());
            }
        }

        // newPositionFrame.id
        let id = sqlx::query!(
            r#"
                INSERT INTO PositionFrame (start)
                VALUES (?);
            "#,
            start
        )
        .execute(&mut *tx)
        .await?
        .last_insert_id() as i32;

        let mut create_frames = HashMap::new();

        match &position_data {
            Some(data) => {
                let mut location = Vec::new();
                let mut rotation = Vec::new();
                for (idx, coor) in (*data).iter().enumerate() {
                    let type_value = coor[0].unwrap_or(-1_f64) as i32;
                    if type_value == NO_EFFECT {
                        let _ = sqlx::query!(
                            r#"
                                INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                                VALUES (?, ?, ?, NULL, NULL, NULL, 0, 0, 0);
                            "#,
                            dancers[idx].id,
                            id,
                            "NO_EFFECT"
                        )
                        .execute(&mut *tx)
                        .await?;

                        location.push([Some(0.0), Some(0.0), Some(0.0)]);
                        rotation.push([Some(0.0), Some(0.0), Some(0.0)]);
                    } else {
                        let _ = sqlx::query!(
                            r#"
                                INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                            "#,
                            dancers[idx].id,
                            id,
                            "POSITION",
                            coor[1],
                            coor[2],
                            coor[3],
                            coor[4],
                            coor[5],
                            coor[6],
                        )
                        .execute(&mut *tx)
                        .await?;

                        location.push([coor[1], coor[2], coor[3]]);
                        rotation.push([coor[4], coor[5], coor[6]]);
                    }
                }
                create_frames.insert(
                    id.to_string(),
                    RedisPosition {
                        start,
                        editing: None,
                        rev: Revision::default(),
                        location,
                        rotation,
                    },
                );
            }
            None => {
                for dancer in dancers {
                    let _ = sqlx::query!(
                        r#"
                            INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                        "#,
                        dancer.id,
                        id,
                        "POSITION",
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                        0.0,
                    )
                    .execute(&mut *tx)
                    .await?;
                }
            }
        }

        tx.commit().await?;

        update_redis_position(mysql, redis, id).await?;

        // subscription
        let map_payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_frames,
                delete_frames: vec![],
                update_frames: HashMap::new(),
            }),
        };

        Subscriptor::publish(map_payload);

        let all_position_frames = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                ORDER BY start ASC;
            "#
        )
        .fetch_all(mysql)
        .await?;

        let mut index = -1;
        for (idx, frame) in all_position_frames.iter().enumerate() {
            if frame.id == id {
                index = idx as i32;
                break;
            }
        }

        let record_payload = PositionRecordPayload {
            mutation: PositionRecordMutationMode::Created,
            edit_by: context.user_id,
            add_id: vec![id],
            update_id: vec![],
            delete_id: vec![],
            index,
        };

        Subscriptor::publish(record_payload);

        update_revision(mysql).await?;

        Ok(PositionFrame {
            id,
            start,
            rev: PositionFrameRevision::default(),
        })
    }
    async fn edit_position_frame(
        &self,
        ctx: &Context<'_>,
        input: EditPositionFrameInput,
    ) -> GQLResult<PositionFrame> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: editPositionFrame");

        let mut tx = mysql.begin().await?;

        let check = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE start = ?;
            "#,
            input.start
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(check) = check {
            if check.id != input.frame_id {
                return Err(format!(
                    "Start Time {} overlapped! (Overlapped frameID: {})",
                    input.start, check.id
                )
                .into());
            }
        }

        let frame_to_edit = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
                SELECT * FROM EditingPositionFrame
                WHERE frame_id = ?;
            "#,
            input.frame_id
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(frame_to_edit) = frame_to_edit {
            if frame_to_edit.user_id != context.user_id {
                return Err(
                    format!("The frame is now editing by {}", frame_to_edit.user_id).into(),
                );
            }
        }

        let position_frame = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE id = ?;
            "#,
            input.frame_id
        )
        .fetch_optional(&mut *tx)
        .await?;

        match position_frame {
            Some(_) => {}
            None => {
                return Err(format!("positionFrame id {} not found", input.frame_id).into());
            }
        }

        let _ = sqlx::query_as!(
            PositionFrameData,
            r#"
                UPDATE PositionFrame
                SET start = ?
                WHERE id = ?;
            "#,
            input.start,
            input.frame_id
        )
        .execute(&mut *tx)
        .await?;

        let _ = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
                UPDATE EditingPositionFrame
                SET frame_id = NULL
                WHERE user_id = ?;
            "#,
            context.user_id
        )
        .execute(&mut *tx)
        .await?;

        // update revision of the frame
        let _ = sqlx::query_as!(
            PositionFrameData,
            r#"
                UPDATE PositionFrame
                SET meta_rev = meta_rev + 1
                WHERE id = ?;
            "#,
            input.frame_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        let position_frame = position_frame.unwrap();
        update_redis_position(mysql, redis, position_frame.id).await?;

        let redis_position = get_redis_position(redis, position_frame.id).await?;
        let update_frames = HashMap::from([(position_frame.id.to_string(), redis_position)]);

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

        let all_position_frames = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                ORDER BY start ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?;

        let mut index = -1;
        for (idx, frame) in all_position_frames.iter().enumerate() {
            if frame.id == position_frame.id {
                index = idx as i32;
                break;
            }
        }

        let record_payload = PositionRecordPayload {
            mutation: PositionRecordMutationMode::Updated,
            edit_by: context.user_id,
            add_id: vec![],
            update_id: vec![position_frame.id],
            delete_id: vec![],
            index,
        };

        Subscriptor::publish(record_payload);

        update_revision(mysql).await?;

        Ok(PositionFrame {
            id: input.frame_id,
            start: input.start,
            rev: PositionFrameRevision {
                meta: position_frame.meta_rev + 1,
                data: position_frame.data_rev,
            },
        })
    }
    async fn delete_position_frame(
        &self,
        ctx: &Context<'_>,
        input: DeletePositionFrameInput,
    ) -> GQLResult<PositionFrame> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: deletePositionFrame");

        let mut tx = mysql.begin().await?;

        let frame_to_delete = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
                SELECT * FROM EditingPositionFrame
                WHERE frame_id = ?;
            "#,
            input.frame_id
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(frame_to_delete) = frame_to_delete {
            if frame_to_delete.user_id != context.user_id {
                return Err(
                    format!("The frame is now editing by {}", frame_to_delete.user_id).into(),
                );
            }
        }

        let deleted_frame = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE id = ?;
            "#,
            input.frame_id
        )
        .fetch_optional(&mut *tx)
        .await?;

        if deleted_frame.is_none() {
            return Err("frame id not found".to_string().into());
        }

        let _ = sqlx::query_as!(
            PositionFrameData,
            r#"
                DELETE FROM PositionFrame
                WHERE id = ?;
            "#,
            input.frame_id
        )
        .execute(&mut *tx)
        .await?;

        let _ = sqlx::query_as!(
            EditingPositionFrameData,
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

        // subscription
        let map_payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_frames: HashMap::new(),
                delete_frames: vec![input.frame_id.to_string()],
                update_frames: HashMap::new(),
            }),
        };
        delete_redis_position(redis, input.frame_id).await?;
        Subscriptor::publish(map_payload);

        let record_payload = PositionRecordPayload {
            mutation: PositionRecordMutationMode::Deleted,
            add_id: vec![],
            update_id: vec![],
            delete_id: vec![input.frame_id],
            edit_by: context.user_id,
            index: -1,
        };
        Subscriptor::publish(record_payload);

        update_revision(mysql).await?;

        let deleted_frame = deleted_frame.unwrap();

        Ok(PositionFrame {
            id: deleted_frame.id,
            start: deleted_frame.start,
            rev: PositionFrameRevision {
                meta: deleted_frame.meta_rev,
                data: deleted_frame.data_rev,
            },
        })
    }
}
