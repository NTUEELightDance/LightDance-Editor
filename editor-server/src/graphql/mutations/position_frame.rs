//! PositionFrame mutation methods.

use crate::db::types::{
    dancer::DancerData, editing_position_frame::EditingPositionFrameData,
    position_frame::PositionFrameData,
};
use crate::graphql::position_record::{PositionRecordMutationMode, PositionRecordPayload};
use crate::graphql::subscriptions::position_map::PositionMapPayload;
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::pos_data::{FrameData, PosDataScalar};
use crate::types::global::UserContext;
use crate::utils::data::{delete_redis_position, update_redis_position};
use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct EditPositionFrameInput {
    pub frame_id: i32,
    pub start: i32,
}

#[derive(InputObject, Default)]
pub struct DeletePositionFrameInput {
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
        position_data: Option<Vec<Vec<f64>>>,
    ) -> GQLResult<PositionFrameData> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let check = sqlx::query_as!(
            PositionFrameData,
            r#"
				SELECT * FROM PositionFrame
				WHERE start = ?;
			"#,
            start
        )
        .fetch_optional(mysql)
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
        .fetch_all(mysql)
        .await?;

        match &position_data {
            Some(data) => {
                if (*data).len() != dancers.len() {
                    return Err(format!(
                        "Not all dancers in payload. Missing number: {}",
                        dancers.len() as i32 - (*data).len() as i32,
                    )
                    .into());
                }
                let mut errors = Vec::<String>::new();
                for (idx, coor) in (*data).iter().enumerate() {
                    if coor.len() != 3 {
                        errors.push(format!(
                            "Not all coordinates in dancer #{} in payload. Missing number: {}",
                            idx,
                            3 - coor.len()
                        ));
                    }
                }
                if !errors.is_empty() {
                    return Err(errors.join("\n").into());
                }
            }
            None => {}
        }

        // newPositionFrame.id
        let id = sqlx::query!(
            r#"
                INSERT INTO PositionFrame (start)
                VALUES (?);
            "#,
            start
        )
        .execute(mysql)
        .await?
        .last_insert_id() as i32;

        match &position_data {
            Some(data) => {
                for (idx, coor) in (*data).iter().enumerate() {
                    let _ = sqlx::query!(
                        r#"
                            INSERT INTO PositionData (dancer_id, frame_id, x, y, z)
                            VALUES (?, ?, ?, ?, ?);
                        "#,
                        dancers[idx].id,
                        id,
                        coor[0],
                        coor[1],
                        coor[2]
                    )
                    .execute(mysql)
                    .await?;
                }
            }
            None => {
                for dancer in dancers {
                    let _ = sqlx::query!(
                        r#"
                            INSERT INTO PositionData (dancer_id, frame_id, x, y, z)
                            VALUES (?, ?, ?, ?, ?);
                        "#,
                        dancer.id,
                        id,
                        0.0,
                        0.0,
                        0.0
                    )
                    .execute(mysql)
                    .await?;
                }
            }
        }

        update_redis_position(mysql, redis, id).await?;

        // subscription
        let map_payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_list: vec![id],
                delete_list: vec![],
                update_list: vec![],
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

        Ok(PositionFrameData { id, start })
    }
    async fn edit_position_frame(
        &self,
        ctx: &Context<'_>,
        input: EditPositionFrameInput,
    ) -> GQLResult<PositionFrameData> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let check = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                WHERE start = ?;
            "#,
            input.start
        )
        .fetch_optional(mysql)
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
        .fetch_optional(mysql)
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
        .fetch_optional(mysql)
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
        .execute(mysql)
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
        .execute(mysql)
        .await?;

        let position_frame = position_frame.unwrap();
        update_redis_position(mysql, redis, position_frame.id).await?;

        // subscription
        let payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_list: vec![],
                delete_list: vec![],
                update_list: vec![position_frame.id],
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

        Ok(PositionFrameData {
            id: input.frame_id,
            start: input.start,
        })
    }
    async fn delete_position_frame(
        &self,
        ctx: &Context<'_>,
        input: DeletePositionFrameInput,
    ) -> GQLResult<PositionFrameData> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let frame_to_delete = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
                SELECT * FROM EditingPositionFrame
                WHERE frame_id = ?;
            "#,
            input.frame_id
        )
        .fetch_optional(mysql)
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
        .fetch_optional(mysql)
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
        .execute(mysql)
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
        .execute(mysql)
        .await?;

        // subscription
        let map_payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_list: vec![],
                delete_list: vec![input.frame_id],
                update_list: vec![],
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

        let deleted_frame = deleted_frame.unwrap();

        Ok(PositionFrameData {
            id: deleted_frame.id,
            start: deleted_frame.start,
        })
    }
}
