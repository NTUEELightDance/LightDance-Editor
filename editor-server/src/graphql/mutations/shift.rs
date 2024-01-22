#![allow(unused)]

use crate::graphql::{subscriptor::Subscriptor, types::color::Color};
use crate::types::global::UserContext;
use crate::utils::data::{
    delete_redis_control, delete_redis_position, update_redis_control, update_redis_position,
};

use async_graphql::{
    Context, Error as GQLError, InputObject, Object, Result as GQLResult, SimpleObject,
};
use itertools::Itertools;
use serde::{Deserialize, Serialize};

#[derive(InputObject, Default)]
struct ShiftQuery {
    start: i32,
    end: i32,
    #[graphql(name = "move")]
    mv: i32,
    shift_control: bool,
    shift_position: bool,
}
struct ControlFrame {
    id: i32,
    start: i32,
    fade: i32,
}
struct PositionFrame {
    id: i32,
    start: i32,
}
struct EditingFrame {
    frame_id: i32,
    user_id: i32,
}

//For Testing and Debugging
fn print_type_of<T>(_: &T) {
    println!("{}", std::any::type_name::<T>())
}

#[derive(Default)]
pub struct FrameMutation;

#[Object]
impl FrameMutation {
    async fn shift(&self, ctx: &Context<'_>, query: ShiftQuery) -> GQLResult<String> {
        let start = query.start;
        let end = query.end;
        let mv = query.mv;
        let shift_control = query.shift_control;
        let shift_position = query.shift_position;

        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let redis_client = &clients.redis_client;

        let mysql = clients.mysql_pool();

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
                EditingFrame,
                r#"
					SELECT ControlFrame.id as frame_id, EditingControlFrame.user_id FROM ControlFrame
					INNER JOIN EditingControlFrame
					ON EditingControlFrame.frame_id = ControlFrame.id
					AND start >= ?
					AND start <= ?
				"#,
                check_start,
                check_end
            )
            .fetch_all(mysql)
            .await?;
            if !editing_control_frame.is_empty() {
                return Err(GQLError::new(format!(
                    "User {} is editing frame {}",
                    editing_control_frame[0].user_id, editing_control_frame[0].frame_id
                )));
            }
        }
        if shift_position {
            let editing_position_frame = sqlx::query_as!(
                EditingFrame,
                r#"
					SELECT PositionFrame.id as frame_id, EditingPositionFrame.user_id FROM PositionFrame
					INNER JOIN EditingPositionFrame
					ON EditingPositionFrame.frame_id = PositionFrame.id
					AND start >= ?
					AND start <= ?
				"#,
                check_start,
                check_end
            )
            .fetch_all(mysql)
            .await?;
            if !editing_position_frame.is_empty() {
                return Err(GQLError::new(format!(
                    "User {} is editing frame {}",
                    editing_position_frame[0].user_id, editing_position_frame[0].frame_id
                )));
            }
        }

        if shift_control {
            //clear overlap interval
            let delete_control_frames = sqlx::query_as!(
                ControlFrame,
                r#"
					SELECT * FROM ControlFrame
					WHERE start >= ?
					AND start <= ?
				"#,
                overlap_start,
                overlap_end
            )
            .fetch_all(mysql)
            .await?;
            let _ = sqlx::query!(
                r#"
					DELETE FROM ControlFrame
					WHERE start >= ?
					AND start <= ?
				"#,
                overlap_start,
                overlap_end
            )
            .execute(mysql)
            .await?;

            //get source data
            let update_control_frames;
            if mv >= 0 {
                update_control_frames = sqlx::query_as!(
                    ControlFrame,
                    r#"
						SELECT * FROM ControlFrame
						WHERE start >= ?
						AND start <= ?
						ORDER BY start DESC
					"#,
                    start,
                    end
                )
                .fetch_all(mysql)
                .await?;
            } else {
                update_control_frames = sqlx::query_as!(
                    ControlFrame,
                    r#"
						SELECT * FROM ControlFrame
						WHERE start >= ?
						AND start <= ?
						ORDER BY start ASC
					"#,
                    start,
                    end
                )
                .fetch_all(mysql)
                .await?;
            }
            //update database and redis
            for control_frame in &update_control_frames {
                let _ = sqlx::query!(
                    r#"
						UPDATE ControlFrame
						SET start = ?
						WHERE start = ?
					"#,
                    control_frame.start + mv,
                    control_frame.start
                )
                .execute(mysql)
                .await?;
                let result = update_redis_control(mysql, redis_client, control_frame.id).await;
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
        }

        if shift_position {
            //clear overlap interval
            let delete_position_frames = sqlx::query_as!(
                PositionFrame,
                r#"
					SELECT * FROM PositionFrame
					WHERE start >= ?
					AND start <= ?
				"#,
                overlap_start,
                overlap_end
            )
            .fetch_all(mysql)
            .await?;
            let _ = sqlx::query!(
                r#"
					DELETE FROM PositionFrame
					WHERE start >= ?
					AND start <= ?
				"#,
                overlap_start,
                overlap_end
            )
            .execute(mysql)
            .await?;

            //get source data
            let update_position_frames;
            if mv >= 0 {
                update_position_frames = sqlx::query_as!(
                    PositionFrame,
                    r#"
						SELECT * FROM PositionFrame
						WHERE start >= ?
						AND start <= ?
						ORDER BY start DESC
					"#,
                    start,
                    end
                )
                .fetch_all(mysql)
                .await?;
            } else {
                update_position_frames = sqlx::query_as!(
                    PositionFrame,
                    r#"
						SELECT * FROM PositionFrame
						WHERE start >= ?
						AND start <= ?
						ORDER BY start ASC
					"#,
                    start,
                    end
                )
                .fetch_all(mysql)
                .await?;
            }
            //update database and redis
            for position_frame in &update_position_frames {
                let _ = sqlx::query!(
                    r#"
						UPDATE PositionFrame
						SET start = ?
						WHERE start = ?
					"#,
                    position_frame.start + mv,
                    position_frame.start
                )
                .execute(mysql)
                .await?;
                let result = update_redis_position(mysql, redis_client, position_frame.id).await;
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
        }

        Ok("Done".to_string())
    }

    //for inserting data while developing
    async fn insert(
        &self,
        ctx: &Context<'_>,
        start: i32,
        end: i32,
        control: bool,
        pos: bool,
    ) -> GQLResult<String> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let _ = sqlx::query!(
            r#"
				ALTER TABLE ControlFrame
				AUTO_INCREMENT = 1;
			"#
        )
        .execute(mysql)
        .await?;
        let _ = sqlx::query!(
            r#"
				ALTER TABLE PositionFrame
				AUTO_INCREMENT = 1;
			"#
        )
        .execute(mysql)
        .await?;

        for i in start..=end {
            if control {
                let _ = sqlx::query!(
                    r#"
						INSERT INTO ControlFrame(start,fade)
						VALUES(?,0);
					"#,
                    i
                )
                .execute(mysql)
                .await?;
                let _ = sqlx::query!(
                    r#"
						INSERT INTO ControlData(alpha,color_id,effect_id,frame_id,part_id,type)
						VALUES(15,1,NULL,?,1,'COLOR');
					"#,
                    i
                )
                .execute(mysql)
                .await?;
            }
            if pos {
                let _ = sqlx::query!(
                    r#"
						INSERT INTO PositionFrame(start)
						VALUES(?);
					"#,
                    i
                )
                .execute(mysql)
                .await?;
                let _ = sqlx::query!(
                    r#"
						INSERT INTO PositionData(dancer_id,frame_id,x,y,z)
						VALUES(1,?,1.1,1.1,1.1);
					"#,
                    i
                )
                .execute(mysql)
                .await?;
            }
        }

        Ok("Done".to_string())
    }
    //for deleting datas after testing
    async fn clear(&self, ctx: &Context<'_>) -> GQLResult<String> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let _ = sqlx::query!(
            r#"
				DELETE FROM ControlFrame;
			"#
        )
        .execute(mysql)
        .await?;
        let _ = sqlx::query!(
            r#"
				DELETE FROM PositionFrame;
			"#
        )
        .execute(mysql)
        .await?;
        Ok("".to_string())
    }
}
