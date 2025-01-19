//! Database setting utilities.

use crate::global;
use crate::types::global::PartType;
use crate::types::global::{PartControl, RedisControl, RedisPosition, Revision};
use crate::utils::vector::partition_by_field;

use itertools::Itertools;
use redis::aio::Connection;
use redis::AsyncCommands;
use redis::Client;
use sqlx::{MySql, Pool};

pub async fn init_data(mysql: &Pool<MySql>) -> Result<(), sqlx::Error> {
    sqlx::query!(
        r#"
            DELETE FROM User;
        "#,
    )
    .execute(mysql)
    .await?;

    Ok(())
}

pub async fn init_redis_control(
    mysql_pool: &Pool<MySql>,
    redis_client: &Client,
) -> Result<(), String> {
    let envs = global::envs::get();

    let frames = sqlx::query!(
        r#"
            SELECT ControlFrame.*, User.name AS user_name
            FROM ControlFrame
            LEFT JOIN EditingControlFrame
            ON ControlFrame.id = EditingControlFrame.frame_id
            LEFT JOIN User
            ON EditingControlFrame.user_id = User.id;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .map_err(|e| e.to_string())?;

    let dancer_controls: Vec<Vec<Vec<_>>> = {
        let dancer_controls = sqlx::query!(
            r#"
                SELECT
                    Dancer.id AS dancer_id,
                    Part.id AS part_id,
                    Part.type AS "part_type: PartType",
                    ControlData.frame_id,
                    ControlData.color_id,
                    ControlData.effect_id,
                    ControlData.alpha
                FROM Dancer
                INNER JOIN Model
                    ON Dancer.model_id = Model.id
                INNER JOIN Part
                    ON Model.id = Part.model_id
                INNER JOIN ControlData
                    ON Part.id = ControlData.part_id AND
                    Dancer.id = ControlData.dancer_id
                LEFT JOIN Color
                    ON ControlData.color_id = Color.id
                LEFT JOIN LEDEffect
                    ON ControlData.effect_id = LEDEffect.id
                ORDER BY ControlData.frame_id, Dancer.id ASC, Part.id ASC;
            "#,
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        let dancer_controls =
            partition_by_field(|dancer_control| dancer_control.frame_id, dancer_controls);

        dancer_controls
            .into_iter()
            .map(|dancer_control| partition_by_field(|part| part.dancer_id, dancer_control))
            .collect_vec()
    };

    let mut result: Vec<(String, String)> = Vec::new();

    frames
        .iter()
        .zip(dancer_controls)
        .for_each(|(frame, dancer_control)| {
            let redis_key = format!("{}{}", envs.redis_ctrl_prefix, frame.id);

            let status = dancer_control
                .iter()
                .map(|dancer_control| {
                    dancer_control
                        .iter()
                        .map(|part_control| match part_control.part_type {
                            PartType::LED => PartControl(
                                part_control.effect_id.unwrap_or(-1),
                                part_control.alpha,
                            ),
                            PartType::FIBER => {
                                PartControl(part_control.color_id.unwrap(), part_control.alpha)
                            }
                        })
                        .collect_vec()
                })
                .collect_vec();

            let result_control = RedisControl {
                fade: frame.fade != 0,
                start: frame.start,
                rev: Revision {
                    meta: frame.meta_rev,
                    data: frame.data_rev,
                },
                editing: frame.user_name.clone(),
                status,
            };

            result.push((redis_key, serde_json::to_string(&result_control).unwrap()));
        });

    if !result.is_empty() {
        let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
        conn.mset::<String, String, ()>(&result)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub async fn init_redis_position(
    mysql_pool: &Pool<MySql>,
    redis_client: &Client,
) -> Result<(), String> {
    let envs = global::envs::get();

    let frames = sqlx::query!(
        r#"
            SELECT PositionFrame.*, User.name AS user_name
            FROM PositionFrame
            LEFT JOIN EditingPositionFrame
            ON PositionFrame.id = EditingPositionFrame.frame_id
            LEFT JOIN User
            ON EditingPositionFrame.user_id = User.id;
        "#,
    )
    .fetch_all(mysql_pool)
    .await
    .map_err(|e| e.to_string())?;

    let mut result = Vec::new();

    let dancer_positions = {
        let dancer_positions = sqlx::query!(
            r#"
                SELECT
                    Dancer.id,
                    PositionData.frame_id,
                    PositionData.x,
                    PositionData.y,
                    PositionData.z,
                    PositionData.rx,
                    PositionData.ry,
                    PositionData.rz
                FROM Dancer
                INNER JOIN PositionData
                ON Dancer.id = PositionData.dancer_id
                ORDER BY Dancer.id ASC;
            "#,
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        partition_by_field(|dancer_position| dancer_position.id, dancer_positions)
    };

    frames.iter().for_each(|frame| {
        let redis_key = format!("{}{}", envs.redis_pos_prefix, frame.id);

        let position = dancer_positions
            .iter()
            .map(|dancer_position| {
                let position = dancer_position
                    .iter()
                    .find(|position| position.frame_id == frame.id)
                    .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

                [position.x, position.y, position.z]
            })
            .collect_vec();

        let rotation = dancer_positions
            .iter()
            .map(|dancer_position| {
                let position = dancer_position
                    .iter()
                    .find(|position| position.frame_id == frame.id)
                    .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

                [position.rx, position.ry, position.rz]
            })
            .collect_vec();

        let result_control = RedisPosition {
            start: frame.start,
            editing: frame.user_name.clone(),
            rev: Revision {
                meta: frame.meta_rev,
                data: frame.data_rev,
            },
            position,
            rotation,
        };

        result.push((redis_key, serde_json::to_string(&result_control).unwrap()));
    });

    if !result.is_empty() {
        let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
        conn.mset::<String, String, ()>(&result)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

pub async fn update_redis_control(
    mysql_pool: &Pool<MySql>,
    redis_client: &Client,
    frame_id: i32,
) -> Result<(), String> {
    let envs = global::envs::get();

    let frame = sqlx::query!(
        r#"
            SELECT ControlFrame.*, User.name AS user_name
            FROM ControlFrame
            LEFT JOIN EditingControlFrame
            ON ControlFrame.id = EditingControlFrame.frame_id
            LEFT JOIN User
            ON EditingControlFrame.user_id = User.id
            WHERE ControlFrame.id = ?;
        "#,
        frame_id
    )
    .fetch_optional(mysql_pool)
    .await
    .map_err(|e| e.to_string())?;

    let frame = match frame {
        Some(frame) => frame,
        None => return Ok(()),
    };

    let dancer_controls = {
        let dancer_controls = sqlx::query!(
            r#"
                SELECT
                    Dancer.id,
                    Part.type AS "part_type: PartType",
                    ControlData.frame_id,
                    ControlData.color_id,
                    ControlData.effect_id,
                    ControlData.alpha
                FROM Dancer
                INNER JOIN Model
                    ON Dancer.model_id = Model.id
                INNER JOIN Part
                    ON Model.id = Part.model_id
                INNER JOIN ControlData
                    ON Part.id = ControlData.part_id AND
                    Dancer.id = ControlData.dancer_id
                WHERE ControlData.frame_id = ?
                ORDER BY Dancer.id ASC, Part.id ASC;
            "#,
            frame.id
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        partition_by_field(|dancer_control| dancer_control.id, dancer_controls)
    };

    let redis_key = format!("{}{}", envs.redis_ctrl_prefix, frame.id);

    let status = dancer_controls
        .iter()
        .map(|dancer_control| {
            dancer_control
                .iter()
                .map(|part_control| match part_control.part_type {
                    PartType::LED => {
                        PartControl(part_control.effect_id.unwrap_or(-1), part_control.alpha)
                    }
                    PartType::FIBER => {
                        PartControl(part_control.color_id.unwrap(), part_control.alpha)
                    }
                })
                .collect_vec()
        })
        .collect_vec();

    let result_control = RedisControl {
        fade: frame.fade != 0,
        start: frame.start,
        rev: Revision {
            meta: frame.meta_rev,
            data: frame.data_rev,
        },
        editing: frame.user_name.clone(),
        status,
    };

    let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
    conn.set::<String, String, ()>(redis_key, serde_json::to_string(&result_control).unwrap())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn update_redis_position(
    mysql_pool: &Pool<MySql>,
    redis_client: &Client,
    frame_id: i32,
) -> Result<(), String> {
    let envs = global::envs::get();

    let frame = sqlx::query!(
        r#"
            SELECT PositionFrame.*, User.name AS user_name
            FROM PositionFrame
            LEFT JOIN EditingPositionFrame
            ON PositionFrame.id = EditingPositionFrame.frame_id
            LEFT JOIN User
            ON EditingPositionFrame.user_id = User.id
            WHERE PositionFrame.id = ?;
        "#,
        frame_id
    )
    .fetch_optional(mysql_pool)
    .await
    .map_err(|e| e.to_string())?;

    let frame = match frame {
        Some(frame) => frame,
        None => return Ok(()),
    };

    let dancer_positions = {
        let dancer_positions = sqlx::query!(
            r#"
                SELECT
                    Dancer.id,
                    PositionData.frame_id,
                    PositionData.x,
                    PositionData.y,
                    PositionData.z,
                    PositionData.rx,
                    PositionData.ry,
                    PositionData.rz
                FROM Dancer
                INNER JOIN PositionData
                ON Dancer.id = PositionData.dancer_id
                WHERE PositionData.frame_id = ?
                ORDER BY Dancer.id ASC;
            "#,
            frame_id
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        partition_by_field(|dancer_position| dancer_position.id, dancer_positions)
    };

    let redis_key = format!("{}{}", envs.redis_pos_prefix, frame.id);

    let position = dancer_positions
        .iter()
        .map(|dancer_position| {
            let position = dancer_position
                .iter()
                .find(|position| position.frame_id == frame.id)
                .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

            [position.x, position.y, position.z]
        })
        .collect_vec();

    let rotation = dancer_positions
        .iter()
        .map(|dancer_position| {
            let position = dancer_position
                .iter()
                .find(|position| position.frame_id == frame.id)
                .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

            [position.rx, position.ry, position.rz]
        })
        .collect_vec();

    let result_pos = RedisPosition {
        start: frame.start,
        editing: frame.user_name.clone(),
        rev: Revision {
            meta: frame.meta_rev,
            data: frame.data_rev,
        },
        position,
        rotation,
    };

    let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
    conn.set::<String, String, ()>(redis_key, serde_json::to_string(&result_pos).unwrap())
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn get_redis_control(
    redis_client: &Client,
    frame_id: i32,
) -> Result<RedisControl, String> {
    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    let cache = conn
        .get::<String, String>(format!(
            "{}{}",
            global::envs::get().redis_ctrl_prefix,
            frame_id
        ))
        .await;

    match cache {
        Ok(cache) => {
            let mut cache: RedisControl = serde_json::from_str(&cache).unwrap();
            cache.editing = None;
            Ok(cache)
        }
        Err(_) => Err(format!("Frame {} not found in redis.", frame_id)),
    }
}

pub async fn get_redis_position(
    redis_client: &Client,
    frame_id: i32,
) -> Result<RedisPosition, String> {
    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    let cache = conn
        .get::<String, String>(format!(
            "{}{}",
            global::envs::get().redis_pos_prefix,
            frame_id
        ))
        .await;

    match cache {
        Ok(cache) => {
            let mut cache: RedisPosition = serde_json::from_str(&cache).unwrap();
            cache.editing = None;
            Ok(cache)
        }
        Err(_) => Err(format!("Frame {} not found in redis.", frame_id)),
    }
}

pub async fn delete_redis_control(redis_client: &Client, frame_id: i32) -> Result<(), String> {
    let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
    conn.del::<String, ()>(format!(
        "{}{}",
        global::envs::get().redis_ctrl_prefix,
        frame_id
    ))
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn delete_redis_position(redis_client: &Client, frame_id: i32) -> Result<(), String> {
    let mut conn: Connection = redis_client.get_tokio_connection().await.unwrap();
    conn.del::<String, ()>(format!(
        "{}{}",
        global::envs::get().redis_pos_prefix,
        frame_id
    ))
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
