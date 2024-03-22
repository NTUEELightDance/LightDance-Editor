//! Database setting utilities.

use crate::db::types::control_data::ControlType;
use crate::db::types::part::PartType;
use crate::global;
use crate::types::global::{PartControl, PositionPos, RedisControl, RedisPosition, Revision};
use crate::utils::vector::partition_by_field;

use itertools::Itertools;
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

    let all_frame_control = {
        let dancer_controls = sqlx::query!(
            r#"
                SELECT
                    Dancer.id AS dancer_id,
                    Part.type AS "part_type: PartType",
                    Part.id AS part_id,
                    ControlData.id AS control_id,
                    ControlData.frame_id,
                    ControlData.type  AS "type: ControlType",
                    ControlData.color_id,
                    ControlData.effect_id,
                    ControlData.alpha,
                    LEDBulb.color_id AS bulb_color_id
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
                LEFT JOIN LEDBulb
                    ON ControlData.id = LEDBulb.control_id
                ORDER BY ControlData.frame_id, Dancer.id ASC, Part.id ASC, LEDBulb.position ASC;
            "#,
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        let dancer_controls =
            partition_by_field(|dancer_control| dancer_control.frame_id, dancer_controls);

        dancer_controls
            .into_iter()
            .map(|dancer_control| {
                let part_control = partition_by_field(|part| part.dancer_id, dancer_control);

                part_control
                    .into_iter()
                    .map(|part_control| partition_by_field(|part| part.control_id, part_control))
                    .collect_vec()
            })
            .collect_vec()
    };

    let mut result = Vec::new();

    frames
        .iter()
        .zip(all_frame_control)
        .for_each(|(frame, frame_control)| {
            let redis_key = format!("{}{}", envs.redis_ctrl_prefix, frame.id);

            let mut frame_status = Vec::new();
            let mut frame_led_status = Vec::new();

            frame_control.iter().for_each(|dancer_control| {
                let mut dancer_status = Vec::new();
                let mut dancer_led_status = Vec::new();

                dancer_control.iter().for_each(|part_control| {
                    if part_control.is_empty() {
                        panic!("Control data {} not found", frame.id);
                    }

                    match part_control[0].r#type {
                        ControlType::Effect => {
                            dancer_status.push(PartControl(
                                part_control[0].effect_id.unwrap_or(-1),
                                part_control[0].alpha,
                            ));
                            dancer_led_status.push(Vec::new());
                        }
                        ControlType::LEDBulbs => {
                            let bulbs = part_control
                                .iter()
                                .map(|data| (data.bulb_color_id.unwrap_or(-1), data.alpha))
                                .collect_vec();

                            dancer_status.push(PartControl(0, part_control[0].alpha));
                            dancer_led_status.push(bulbs);
                        }
                        ControlType::Color => {
                            dancer_status.push(PartControl(
                                part_control[0].color_id.unwrap_or(-1),
                                part_control[0].alpha,
                            ));
                            dancer_led_status.push(Vec::new());
                        }
                    };
                });

                frame_status.push(dancer_status);
                frame_led_status.push(dancer_led_status);
            });

            let result_control = RedisControl {
                fade: frame.fade != 0,
                start: frame.start,
                rev: Revision {
                    meta: frame.meta_rev,
                    data: frame.data_rev,
                },
                editing: frame.user_name.clone(),
                status: frame_status,
                led_status: frame_led_status,
            };

            println!("Redis key: {}", redis_key);

            result.push((redis_key, serde_json::to_string(&result_control).unwrap()));
        });

    if !result.is_empty() {
        let mut conn = redis_client.get_tokio_connection().await.unwrap();
        conn.mset(&result).await.map_err(|e| e.to_string())?;
    }

    println!("Redis done initializing ControlMap");

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
                    PositionData.z
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

        let pos = dancer_positions
            .iter()
            .map(|dancer_position| {
                let position = dancer_position
                    .iter()
                    .find(|position| position.frame_id == frame.id)
                    .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

                PositionPos(position.x, position.y, position.z)
            })
            .collect_vec();

        let result_control = RedisPosition {
            start: frame.start,
            editing: frame.user_name.clone(),
            rev: Revision {
                meta: frame.meta_rev,
                data: frame.data_rev,
            },
            pos,
        };

        result.push((redis_key, serde_json::to_string(&result_control).unwrap()));
    });

    if !result.is_empty() {
        let mut conn = redis_client.get_tokio_connection().await.unwrap();
        conn.mset(&result).await.map_err(|e| e.to_string())?;
    }

    println!("Redis done initializing PositionMap");

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

    let frame_control = {
        let dancer_controls = sqlx::query!(
            r#"
                SELECT
                    Dancer.id AS dancer_id,
                    Part.type AS "part_type: PartType",
                    Part.id AS part_id,
                    ControlData.frame_id,
                    ControlData.id AS control_id,
                    ControlData.effect_id,
                    ControlData.color_id,
                    ControlData.alpha,
                    ControlData.type  AS "type: ControlType",
                    LEDBulb.color_id AS bulb_color_id
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
                LEFT JOIN LEDBulb
                    ON ControlData.id = LEDBulb.control_id
                WHERE ControlData.frame_id = ?
                ORDER BY Dancer.id ASC, Part.id ASC, LEDBulb.position ASC;
            "#,
            frame.id
        )
        .fetch_all(mysql_pool)
        .await
        .map_err(|e| e.to_string())?;

        let part_control = partition_by_field(|part| part.dancer_id, dancer_controls);

        part_control
            .into_iter()
            .map(|part_control| partition_by_field(|part| part.control_id, part_control))
            .collect_vec()
    };

    let redis_key = format!("{}{}", envs.redis_ctrl_prefix, frame.id);
    println!("Redis key: {}", redis_key);

    let mut frame_status = Vec::new();
    let mut frame_led_status = Vec::new();

    frame_control.iter().for_each(|dancer_control| {
        let mut dancer_status = Vec::new();
        let mut dancer_led_status = Vec::new();

        dancer_control.iter().for_each(|part_control| {
            if part_control.is_empty() {
                panic!("Control data {} not found", frame.id);
            }

            match part_control[0].r#type {
                ControlType::Effect => {
                    dancer_status.push(PartControl(
                        part_control[0].effect_id.unwrap_or(-1),
                        part_control[0].alpha,
                    ));
                    dancer_led_status.push(Vec::new());
                }
                ControlType::LEDBulbs => {
                    let bulbs = part_control
                        .iter()
                        .map(|data| (data.bulb_color_id.unwrap_or(-1), data.alpha))
                        .collect_vec();

                    dancer_status.push(PartControl(0, part_control[0].alpha));
                    dancer_led_status.push(bulbs);
                }
                ControlType::Color => {
                    dancer_status.push(PartControl(
                        part_control[0].color_id.unwrap_or(-1),
                        part_control[0].alpha,
                    ));
                    dancer_led_status.push(Vec::new());
                }
            };
        });

        frame_status.push(dancer_status);
        frame_led_status.push(dancer_led_status);
    });

    let result_control = RedisControl {
        fade: frame.fade != 0,
        start: frame.start,
        rev: Revision {
            meta: frame.meta_rev,
            data: frame.data_rev,
        },
        editing: frame.user_name.clone(),
        status: frame_status,
        led_status: frame_led_status,
    };

    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    conn.set(redis_key, serde_json::to_string(&result_control).unwrap())
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
                    PositionData.z
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
    println!("Redis key: {}", redis_key);

    let pos = dancer_positions
        .iter()
        .map(|dancer_position| {
            let position = dancer_position
                .iter()
                .find(|position| position.frame_id == frame.id)
                .unwrap_or_else(|| panic!("PositionData {} not found", frame.id));

            PositionPos(position.x, position.y, position.z)
        })
        .collect_vec();

    let result_pos = RedisPosition {
        start: frame.start,
        editing: frame.user_name.clone(),
        rev: Revision {
            meta: frame.meta_rev,
            data: frame.data_rev,
        },
        pos,
    };

    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    conn.set(redis_key, serde_json::to_string(&result_pos).unwrap())
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
    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    conn.del(format!(
        "{}{}",
        global::envs::get().redis_ctrl_prefix,
        frame_id
    ))
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

pub async fn delete_redis_position(redis_client: &Client, frame_id: i32) -> Result<(), String> {
    let mut conn = redis_client.get_tokio_connection().await.unwrap();
    conn.del(format!(
        "{}{}",
        global::envs::get().redis_pos_prefix,
        frame_id
    ))
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}
