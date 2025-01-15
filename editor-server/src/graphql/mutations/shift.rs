use crate::graphql::subscriptions::{
    control_map::ControlMapPayload, position_map::PositionMapPayload,
};
use crate::graphql::subscriptor::Subscriptor;
use crate::graphql::types::{control_data::*, pos_data::*};
use crate::types::global::{RedisControl, RedisPosition, UserContext};
use crate::utils::data::{
    get_redis_control, get_redis_position, update_redis_control, update_redis_position,
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

        tracing::info!("Mutation: shift");

        //check negative
        if start + mv < 0 {
            return Err(GQLError::new("Negative start is not legal"));
        }
        //check start after end
        if start >= end {
            return Err(GQLError::new("Start must smaller than end"));
        }

        let target_start = start + mv;
        let target_end = end + mv;

        let check_start = if mv > 0 {
            std::cmp::max(end, target_start)
        } else {
            target_start
        };
        let check_end = if mv > 0 {
            target_end
        } else {
            std::cmp::min(start, target_end)
        };

        // check editing
        let control_frames_to_shift = if shift_control {
            let exists_editing_frame = sqlx::query!(
                r#"
                    SELECT COUNT(*) as count
                    FROM ControlFrame
                    INNER JOIN EditingControlFrame
                    ON EditingControlFrame.frame_id = ControlFrame.id
                    AND start >= ?
                    AND start <= ?;
                "#,
                start,
                end
            )
            .fetch_one(mysql)
            .await?
            .count
                > 0;

            if exists_editing_frame {
                return Err(GQLError::new("Editing frame exists in the interval"));
            }

            let frames_to_shift = sqlx::query!(
                r#"
                    SELECT id, start FROM ControlFrame
                    WHERE start >= ?
                    AND start <= ?
                    ORDER BY start ASC;
                "#,
                start,
                end
            )
            .fetch_all(mysql)
            .await?;

            let frames_to_check = sqlx::query!(
                r#"
                    SELECT start FROM ControlFrame
                    WHERE start >= ?
                    AND start <= ?
                    ORDER BY start ASC;
                "#,
                check_start,
                check_end
            )
            .fetch_all(mysql)
            .await?;

            // check duplicated start
            let mut check_index = 0;
            for frame in frames_to_shift.iter() {
                while let Some(check_frame) = frames_to_check.get(check_index) {
                    if frame.start == check_frame.start {
                        return Err(GQLError::new(format!(
                            "Duplicated frame start at {} and {}",
                            frame.start, check_frame.start
                        )));
                    }
                    if frame.start < check_frame.start {
                        break;
                    }
                    check_index += 1;
                }
            }

            frames_to_shift
        } else {
            Vec::new()
        };

        let pos_frames_to_shift = if shift_position {
            let exists_editing_frame = sqlx::query!(
                r#"
                    SELECT COUNT(*) as count
                    FROM PositionFrame
                    INNER JOIN EditingPositionFrame
                    ON EditingPositionFrame.frame_id = PositionFrame.id
                    AND start >= ?
                    AND start <= ?;
                "#,
                start,
                end
            )
            .fetch_one(mysql)
            .await?
            .count
                > 0;

            if exists_editing_frame {
                return Err(GQLError::new("Editing frame exists in the interval"));
            }

            let frames_to_shift = sqlx::query!(
                r#"
                    SELECT id, start FROM PositionFrame
                    WHERE start >= ?
                    AND start <= ?
                    ORDER BY start ASC;
                "#,
                start,
                end
            )
            .fetch_all(mysql)
            .await?;

            let frames_to_check = sqlx::query!(
                r#"
                    SELECT start FROM PositionFrame
                    WHERE start >= ?
                    AND start <= ?
                    ORDER BY start ASC;
                "#,
                check_start,
                check_end
            )
            .fetch_all(mysql)
            .await?;

            // check duplicated start
            let mut check_index = 0;
            for frame in &frames_to_shift {
                while let Some(check_frame) = frames_to_check.get(check_index) {
                    if frame.start == check_frame.start {
                        return Err(GQLError::new(format!(
                            "Duplicated frame start at {} and {}",
                            frame.start, check_frame.start
                        )));
                    }
                    if frame.start < check_frame.start {
                        break;
                    }
                    check_index += 1;
                }
            }

            frames_to_shift
        } else {
            Vec::new()
        };

        if shift_control {
            // update database and redis
            sqlx::query!(
                r#"
                    UPDATE ControlFrame
                    SET
                        start = start + ?,
                        meta_rev = meta_rev + 1
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                mv,
                start,
                end
            )
            .execute(mysql)
            .await?;

            let update_control_ids: Vec<i32> = control_frames_to_shift
                .into_iter()
                .map(|frame| frame.id)
                .collect_vec();

            //subscription
            let mut update_control_frames: HashMap<String, RedisControl> = HashMap::new();
            for id in &update_control_ids {
                let result = {
                    let update_result = update_redis_control(mysql, redis_client, *id).await;
                    let get_result = get_redis_control(redis_client, *id).await;

                    if update_result.is_err() {
                        Err(update_result.err().unwrap())
                    } else if get_result.is_err() {
                        Err(get_result.err().unwrap())
                    } else {
                        Ok(get_result.ok().unwrap())
                    }
                };

                let redis_control = match result {
                    Ok(redis_control) => redis_control,
                    Err(msg) => return Err(GQLError::new(msg)),
                };
                update_control_frames.insert(id.to_string(), redis_control);
            }

            let control_map_payload = ControlMapPayload {
                edit_by: context.user_id,
                frame: ControlFramesSubDatScalar(ControlFramesSubData {
                    create_frames: HashMap::new(),
                    delete_frames: Vec::new(),
                    update_frames: update_control_frames,
                }),
            };
            Subscriptor::publish(control_map_payload);
        }

        if shift_position {
            sqlx::query!(
                r#"
                    UPDATE PositionFrame
                    SET
                        start = start + ?,
                        meta_rev = meta_rev + 1
                    WHERE start >= ?
                    AND start <= ?;
                "#,
                mv,
                start,
                end
            )
            .execute(mysql)
            .await?;

            let update_position_ids: Vec<i32> = pos_frames_to_shift
                .into_iter()
                .map(|frame| frame.id)
                .collect_vec();

            //subscription
            let mut update_position_frames: HashMap<String, RedisPosition> = HashMap::new();
            for id in &update_position_ids {
                let result = {
                    let update_result = update_redis_position(mysql, redis_client, *id).await;
                    let get_result = get_redis_position(redis_client, *id).await;

                    if update_result.is_err() {
                        Err(update_result.err().unwrap())
                    } else if get_result.is_err() {
                        Err(get_result.err().unwrap())
                    } else {
                        Ok(get_result.ok().unwrap())
                    }
                };

                let redis_position = match result {
                    Ok(redis_position) => redis_position,
                    Err(msg) => return Err(GQLError::new(msg)),
                };
                update_position_frames.insert(id.to_string(), redis_position);
            }

            //subscription
            let position_map_payload = PositionMapPayload {
                edit_by: context.user_id,
                frame: PosDataScalar(FrameData {
                    create_frames: HashMap::new(),
                    delete_frames: Vec::new(),
                    update_frames: update_position_frames,
                }),
            };
            Subscriptor::publish(position_map_payload);
        }

        update_revision(mysql).await?;

        Ok(ShiftResponse {
            msg: "Shift success".to_string(),
            ok: true,
        })
    }
}
