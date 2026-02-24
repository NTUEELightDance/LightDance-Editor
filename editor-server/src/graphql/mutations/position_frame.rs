//! PositionFrame mutation methods.

use crate::db::types::{
    dancer::DancerData, editing_position_frame::EditingPositionFrameData,
    position_frame::PositionFrameData,
};
use crate::graphql::mutations::request_edit::RequestEditMutation;
use crate::graphql::position_record::{PositionRecordMutationMode, PositionRecordPayload};
use crate::graphql::subscriptions::position_map::PositionMapPayload;
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::pos_data::{FrameData, PosDataScalar};
use crate::graphql::types::pos_frame::{PositionFrame, PositionFrameRevision};
use crate::types::global::{RedisPosition, Revision, UserContext};
use crate::utils::data::{delete_redis_position, get_redis_position, update_redis_position};
use crate::utils::revision::update_revision;

use async_graphql::{Context, Error, InputObject, Object, Result as GQLResult};
use std::collections::{BTreeMap, HashMap};

#[derive(InputObject, Default)]
pub struct EditPositionFrameInput {
    pub frame_id: i32,
    pub start: i32,
}

#[derive(InputObject, Default)]
pub struct DeletePositionFrameInput {
    #[graphql(name = "frameID")]
    pub frame_id: i32,
    pub loaded_dancers: Vec<bool>,
}

#[derive(InputObject)]
pub struct AddPositionFrameInput {
    start: i32,
    position_data: Option<Vec<Vec<f64>>>,
    has_position: Vec<bool>,
}

#[derive(Default)]
pub struct PositionFrameMutation;

#[Object]
impl PositionFrameMutation {
    async fn add_position_frame(
        &self,
        ctx: &Context<'_>,
        input: AddPositionFrameInput,
    ) -> GQLResult<PositionFrame> {
        let AddPositionFrameInput {
            start,
            position_data,
            has_position,
        } = input;

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

        if let Some(data) = &position_data {
            if has_position.len() != data.len() {
                return Err(format!(
                        "Position data and has_position has different length. Position data length: {}, has_position length: {}",
                        data.len(),
                        has_position.len(),
                ).into());
            }

            if data.len() != dancers.len() {
                return Err(format!(
                    "Not all dancers in payload. Missing number: {}",
                    dancers.len() as i32 - data.len() as i32,
                )
                .into());
            }
            let mut errors = Vec::<String>::new();

            for (idx, coordinatesdinates) in data.iter().enumerate() {
                // (bool, [x, y, z, rx, ry, rz])
                if coordinatesdinates.len() != 6 {
                    errors.push(format!(
                        "Dancer #{} data must have 6 elements [x, y, z, rx, ry, rz]. Got: {}",
                        idx + 1,
                        coordinatesdinates.len()
                    ));
                    continue;
                }

                // validate type value
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
                for (idx, coordinates) in (*data).iter().enumerate() {
                    if !has_position[idx] {
                        sqlx::query!(
                            r#"
                                INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                            "#,
                            dancers[idx].id,
                            id,
                            "NO_EFFECT",
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                            0.0,
                        )
                        .execute(&mut *tx)
                        .await?;
                    } else {
                        sqlx::query!(
                            r#"
                            INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                        "#,
                            dancers[idx].id,
                            id,
                            "POSITION",
                            coordinates[0],
                            coordinates[1],
                            coordinates[2],
                            coordinates[3],
                            coordinates[4],
                            coordinates[5],
                        )
                        .execute(&mut *tx)
                        .await?;
                    }
                }
                create_frames.insert(
                    id.to_string(),
                    RedisPosition {
                        start,
                        editing: None,
                        has_position,
                        rev: Revision::default(),
                        location: data
                            .iter()
                            .map(|coor| [coor[0], coor[1], coor[2]])
                            .collect(),
                        rotation: data
                            .iter()
                            .map(|coor| [coor[3], coor[4], coor[5]])
                            .collect(),
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

        // <<<<<<< HEAD
        //         // tx.commit().await?;
        // =======
        //         tx.commit().await?;
        // >>>>>>> 2edb296 (AddPositionFrame)

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

        let DeletePositionFrameInput {
            frame_id,
            loaded_dancers,
        } = input;

        let mut tx = mysql.begin().await?;

        let frame_to_delete = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
                SELECT * FROM EditingPositionFrame
                WHERE frame_id = ?;
            "#,
            frame_id
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

        // TODO: I think this is very ugly, should have this fixed later
        let request = RequestEditMutation;
        let request_result = request.request_edit_position(ctx, frame_id).await??;

        if !request_result.ok {
            return Err(Error::new(format!(
                "Request edit failed because frame is edited by user {}",
                request_result.editing.unwrap()
            )));
        }

        let dancer_has_effect = {
            let control_data = sqlx::query!(
                r#"
                    SELECT
                        PositionData.type,
                        PositionData.dancer_id
                    FROM PositionData
                    WHERE PositionData.frame_id = ?
                    ORDER BY PositionData.dancer_id ASC;
                "#,
                frame_id
            )
            .fetch_all(&mut *tx)
            .await?;
            BTreeMap::from_iter(
                control_data
                    .into_iter()
                    .map(|data| (data.dancer_id, data.r#type.as_str() != "NO_EFFECT")),
            )
        };

        // We can directly delete the frame iff there does not exist
        // a dancer that is loaded and is not NO_EFFECT in this frame
        // NOTE: We can probably return when can_delete_frame is or'ed
        // with the first false, but there is only about 10 dancers, so
        // the performance difference can be (I think) ignored
        // TODO: Perhaps fix this with some pretty syntax later
        let mut can_delete_frame = true;
        for (i, (_, has_effect)) in dancer_has_effect.iter().enumerate() {
            can_delete_frame &= !(has_effect & !loaded_dancers[i]);
        }

        if can_delete_frame {
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
        } else {
            let dancers_id = Vec::from_iter(
                sqlx::query!(
                    r#"
                        SELECT Dancer.id FROM Dancer
                        ORDER BY Dancer.id ASC;
                    "#
                )
                .fetch_all(&mut *tx)
                .await?
                .into_iter()
                .map(|data| data.id),
            );

            // We make every loaded dancer in the frame NO_EFFECT
            for (i, loaded) in loaded_dancers.iter().enumerate() {
                if *loaded {
                    let _ = sqlx::query!(
                        r#"
                            UPDATE PositionData
                            SET type = "NO_EFFECT"
                            WHERE PositionData.dancer_id = ? AND PositionData.frame_id = ?;
                        "#,
                        dancers_id[i],
                        frame_id,
                    );
                }
            }
        }

        tx.commit().await?;

        let (delete_frames, update_frames) = if can_delete_frame {
            (vec![frame_id.to_string()], HashMap::new())
        } else {
            (
                vec![],
                HashMap::from([(
                    frame_id.to_string(),
                    get_redis_position(redis, frame_id).await?,
                )]),
            )
        };

        // subscription
        let map_payload = PositionMapPayload {
            edit_by: context.user_id,
            frame: PosDataScalar(FrameData {
                create_frames: HashMap::new(),
                delete_frames,
                update_frames,
            }),
        };

        if can_delete_frame {
            delete_redis_position(redis, frame_id).await?;
        } else {
            update_redis_position(mysql, redis, frame_id).await?;
        }

        Subscriptor::publish(map_payload);

        let (mutation, update_id, delete_id) = if can_delete_frame {
            (PositionRecordMutationMode::Deleted, vec![], vec![frame_id])
        } else {
            (PositionRecordMutationMode::Updated, vec![frame_id], vec![])
        };

        let record_payload = PositionRecordPayload {
            mutation,
            add_id: vec![],
            update_id,
            delete_id,
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
