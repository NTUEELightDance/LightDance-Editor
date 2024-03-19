use crate::db::types::{
    control_frame::ControlFrameData, editing_control_frame::EditingControlFrameData,
    editing_position_frame::EditingPositionFrameData, position_frame::PositionFrameData,
};
use crate::graphql::subscriptions::{
    control_map::ControlMapPayload, position_map::PositionMapPayload,
};
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::{control_data::*, pos_data::*};
use crate::types::global::{RedisControl, RedisPosition, UserContext};
use crate::utils::data::{
    delete_redis_control, delete_redis_position, get_redis_control, get_redis_position,
    update_redis_control, update_redis_position,
};
use crate::utils::revision::update_revision;

use async_graphql::{Context, Error as GQLError, Object, Result as GQLResult, SimpleObject};
use itertools::Itertools;
use std::collections::HashMap;

#[derive(SimpleObject, Default)]
struct ShiftResponse {
    msg: String,
    ok: bool,
}

#[derive(Default)]
pub struct FrameMutation;

#[Object]
impl FrameMutation {
    async fn shift(
        &self,
        ctx: &Context<'_>,
        start: i32,
        end: i32,
        #[graphql(name = "move")] mv: i32,
        shift_control: bool,
        shift_position: bool,
    ) -> GQLResult<ShiftResponse> {
        let context = ctx.data::<UserContext>()?;

        let clients = context.clients;
        let redis_client = &clients.redis_client;

        let mysql = clients.mysql_pool();
        let mut tx = mysql.begin().await?;

        println!("Shift start: {}, end: {}, mv: {}", start, end, mv);

        //check negative
        if start + mv < 0 {
            return Err(GQLError::new("Negative start is not legal"));
        }
        //check start after end
        if start >= end {
            return Err(GQLError::new("Start must smaller than end"));
        }
        //overlap_interval & check_interval
        let overlap_start = if mv >= 0 {
            if start + mv > end {
                start + mv
            } else {
                end + 1
            }
        } else {
            start + mv
        };
        let overlap_end = if mv >= 0 {
            end + mv
        } else if end + mv < start {
            end + mv
        } else {
            start - 1
        };
        let check_start = if mv >= 0 { start } else { start + mv };
        let check_end = if mv >= 0 { end + mv } else { end };

        //check editing
        if shift_control {
            let editing_control_frame = sqlx::query_as!(
                EditingControlFrameData,
                r#"
                    SELECT ControlFrame.id as frame_id, EditingControlFrame.user_id FROM ControlFrame
                    INNER JOIN EditingControlFrame
                    ON EditingControlFrame.frame_id = ControlFrame.id
                    AND start >= ?
                    AND start <= ?;
                "#,
                check_start,
                check_end
            )
            .fetch_all(&mut *tx)
            .await?;
            if !editing_control_frame.is_empty() {
                for editing in editing_control_frame {
                    match editing.frame_id {
                        Some(frame_id) => {
                            return Err(GQLError::new(format!(
                                "User {} is editing frame {}",
                                editing.user_id, frame_id
                            )));
                        }
                        None => {}
                    }
                }
            }
        }
        if shift_position {
            let editing_position_frame = sqlx::query_as!(
                EditingPositionFrameData,
                r#"
                    SELECT PositionFrame.id as frame_id, EditingPositionFrame.user_id FROM PositionFrame
                    INNER JOIN EditingPositionFrame
                    ON EditingPositionFrame.frame_id = PositionFrame.id
                    AND start >= ?
                    AND start <= ?;
                "#,
                check_start,
                check_end
            )
            .fetch_all(&mut *tx)
            .await?;
            if !editing_position_frame.is_empty() {
                for editing in editing_position_frame {
                    match editing.frame_id {
                        Some(frame_id) => {
                            return Err(GQLError::new(format!(
                                "User {} is editing frame {}",
                                editing.user_id, frame_id
                            )));
                        }
                        None => {}
                    }
                }
            }
        }

        let control_map_payload = if shift_control {
            //clear overlap interval
            let delete_control_frames = sqlx::query_as!(
                ControlFrameData,
                r#"
                    SELECT
                        id,
                        start,
                        fade as "fade: bool",
                        meta_rev,
                        data_rev
                    FROM ControlFrame
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                overlap_start,
                overlap_end
            )
            .fetch_all(&mut *tx)
            .await?;
            let _ = sqlx::query!(
                r#"
                    DELETE FROM ControlFrame
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                overlap_start,
                overlap_end
            )
            .execute(&mut *tx)
            .await?;

            //get source data
            let update_control_frames;
            if mv >= 0 {
                update_control_frames = sqlx::query_as!(
                    ControlFrameData,
                    r#"
                        SELECT
                            id,
                            start,
                            fade as "fade: bool",
                            meta_rev,
                            data_rev
                        FROM ControlFrame
                        WHERE start >= ?
                        AND start <= ?
                        ORDER BY start DESC;
                    "#,
                    start,
                    end
                )
                .fetch_all(&mut *tx)
                .await?;
            } else {
                update_control_frames = sqlx::query_as!(
                    ControlFrameData,
                    r#"
                        SELECT
                            id,
                            start,
                            fade as "fade: bool",
                            meta_rev,
                            data_rev
                        FROM ControlFrame
                        WHERE start >= ?
                        AND start <= ?
                        ORDER BY start ASC;
                    "#,
                    start,
                    end
                )
                .fetch_all(&mut *tx)
                .await?;
            }
            //update database and redis
            for control_frame in &update_control_frames {
                let _ = sqlx::query!(
                    r#"
                        UPDATE ControlFrame
                        SET
                            start = ?,
                            meta_rev = meta_rev + 1
                        WHERE start = ?;
                    "#,
                    control_frame.start + mv,
                    control_frame.start
                )
                .execute(&mut *tx)
                .await?;
                let result = update_redis_control(&mut *tx, redis_client, control_frame.id).await;
                match result {
                    Ok(_) => (),
                    Err(msg) => return Err(GQLError::new(msg)),
                };
            }
            let update_control_ids: Vec<i32> = update_control_frames
                .into_iter()
                .map(|update_control_frame| update_control_frame.id)
                .collect_vec();
            let delete_control_list: Vec<i32> = delete_control_frames
                .into_iter()
                .map(|delete_control_frame| delete_control_frame.id)
                .collect_vec();
            for id in &delete_control_list {
                let result = delete_redis_control(redis_client, *id).await;
                match result {
                    Ok(_) => (),
                    Err(msg) => return Err(GQLError::new(msg)),
                };
            }

            //subscription
            let mut update_control_frames: HashMap<String, RedisControl> = HashMap::new();
            for id in &update_control_ids {
                let result = get_redis_control(redis_client, *id).await;
                let redis_control = match result {
                    Ok(redis_control) => redis_control,
                    Err(msg) => return Err(GQLError::new(msg)),
                };
                update_control_frames.insert(id.to_string(), redis_control);
            }

            Some(ControlMapPayload {
                edit_by: context.user_id,
                frame: ControlFramesSubDatScalar(ControlFramesSubData {
                    create_frames: HashMap::new(),
                    delete_frames: delete_control_list.clone(),
                    update_frames: update_control_frames,
                }),
            })
        } else {
            None
        };

        let position_map_payload = if shift_position {
            //clear overlap interval
            let delete_position_frames = sqlx::query_as!(
                PositionFrameData,
                r#"
                    SELECT * FROM PositionFrame
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                overlap_start,
                overlap_end
            )
            .fetch_all(&mut *tx)
            .await?;
            let _ = sqlx::query!(
                r#"
                    DELETE FROM PositionFrame
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                overlap_start,
                overlap_end
            )
            .execute(&mut *tx)
            .await?;

            //get source data
            let update_position_frames;
            if mv >= 0 {
                update_position_frames = sqlx::query_as!(
                    PositionFrameData,
                    r#"
                        SELECT * FROM PositionFrame
                        WHERE start >= ?
                        AND start <= ?
                        ORDER BY start DESC;
                    "#,
                    start,
                    end
                )
                .fetch_all(&mut *tx)
                .await?;
            } else {
                update_position_frames = sqlx::query_as!(
                    PositionFrameData,
                    r#"
                        SELECT * FROM PositionFrame
                        WHERE start >= ?
                        AND start <= ?
                        ORDER BY start ASC;
                    "#,
                    start,
                    end
                )
                .fetch_all(&mut *tx)
                .await?;
            }
            //update database and redis
            for position_frame in &update_position_frames {
                let _ = sqlx::query!(
                    r#"
                        UPDATE PositionFrame
                        SET
                            start = ?, 
                            meta_rev = meta_rev + 1
                        WHERE start = ?;
                    "#,
                    position_frame.start + mv,
                    position_frame.start
                )
                .execute(&mut *tx)
                .await?;

                let result = update_redis_position(&mut *tx, redis_client, position_frame.id).await;
                match result {
                    Ok(_) => (),
                    Err(msg) => return Err(GQLError::new(msg)),
                };
            }
            let update_position_ids: Vec<i32> = update_position_frames
                .into_iter()
                .map(|update_position_frame| update_position_frame.id)
                .collect_vec();
            let delete_position_list: Vec<i32> = delete_position_frames
                .into_iter()
                .map(|delete_position_frame| delete_position_frame.id)
                .collect_vec();
            for id in &delete_position_list {
                let result = delete_redis_position(redis_client, *id).await;
                match result {
                    Ok(_) => (),
                    Err(msg) => return Err(GQLError::new(msg)),
                };
            }
            let delete_position_ids: Vec<String> = delete_position_list
                .clone()
                .into_iter()
                .map(|id| id.to_string())
                .collect();
            let mut update_position_frames: HashMap<String, RedisPosition> = HashMap::new();
            for id in &update_position_ids {
                let result = get_redis_position(redis_client, *id).await;
                let redis_position = match result {
                    Ok(redis_position) => redis_position,
                    Err(msg) => return Err(GQLError::new(msg)),
                };
                update_position_frames.insert(id.to_string(), redis_position);
            }

            //subscription
            Some(PositionMapPayload {
                edit_by: context.user_id,
                frame: PosDataScalar(FrameData {
                    create_frames: HashMap::new(),
                    delete_frames: delete_position_ids,
                    update_frames: update_position_frames,
                }),
            })
        } else {
            None
        };

        update_revision(&mut *tx).await?;

        // Commit the transaction
        tx.commit().await?;

        if let Some(control_map_payload) = control_map_payload {
            Subscriptor::publish(control_map_payload);
        }
        if let Some(position_map_payload) = position_map_payload {
            Subscriptor::publish(position_map_payload);
        }

        Ok(ShiftResponse {
            msg: "Shift success".to_string(),
            ok: true,
        })
    }
}
