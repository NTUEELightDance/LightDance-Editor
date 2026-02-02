use crate::db::types::control_data::ControlType;
use crate::global;
use crate::types::global::{JsonData, PartType};
use crate::utils::data::{init_redis_control, init_redis_position};

use axum::{extract::Multipart, http::StatusCode, response::Json};
use indicatif::ProgressBar;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize)]
pub struct UploadDataResponse(String);

#[derive(Debug, Deserialize, Serialize)]
pub struct UploadDataFailedResponse {
    err: String,
}

trait IntoResult<T, E> {
    fn into_result(self) -> Result<T, E>;
}

impl<R, E> IntoResult<R, (StatusCode, Json<UploadDataFailedResponse>)> for Result<R, E>
where
    E: std::string::ToString,
{
    fn into_result(self) -> Result<R, (StatusCode, Json<UploadDataFailedResponse>)> {
        match self {
            Ok(ok) => Ok(ok),
            Err(err) => Err((
                StatusCode::BAD_REQUEST,
                Json(UploadDataFailedResponse {
                    err: err.to_string(),
                }),
            )),
        }
    }
}

pub async fn upload_data(
    mut files: Multipart,
) -> Result<(StatusCode, Json<UploadDataResponse>), (StatusCode, Json<UploadDataFailedResponse>)> {
    // read request
    if let Some(mut field) = files.next_field().await.into_result()? {
        let mut concatenated_bytes = Vec::new();
        while let Some(chunk_data) = field.chunk().await.into_result()? {
            concatenated_bytes.extend_from_slice(&chunk_data);
        }
        let raw_data = concatenated_bytes.as_slice();
        // parse json & check types
        let data_obj: JsonData = match serde_json::from_slice(raw_data) {
            Ok(data_obj) => data_obj,
            Err(e) => {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!("JSON was not well formatted: {e}"),
                    }),
                ))
            }
        };

        let clients = global::clients::get();

        let mysql = clients.mysql_pool();

        // Cleaner way to do this?
        let _ = sqlx::query!(r#"DELETE FROM Color"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM PositionData"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM ControlData"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM Part"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM Dancer"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM PositionFrame"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM ControlFrame"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM LEDEffect"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM LEDEffectState"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM EffectListData"#,)
            .execute(mysql)
            .await;
        let _ = sqlx::query!(r#"DELETE FROM Model"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM Revision"#,)
            .execute(mysql)
            .await;

        let mut tx = mysql.begin().await.into_result()?;

        // HashMap<ColorName, ColorID>
        let mut color_dict: HashMap<&String, i32> = HashMap::new();
        let color_progress = ProgressBar::new(data_obj.color.len().try_into().unwrap_or_default());

        for (color_key, color_code) in &data_obj.color {
            let color_id = sqlx::query!(
                r#"
                    INSERT INTO Color (name, r, g, b)
                    VALUES (?, ?, ?, ?);
                "#,
                color_key,
                color_code[0],
                color_code[1],
                color_code[2],
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            color_dict.insert(color_key, color_id);
            color_progress.inc(1);
        }
        let none_string = "none".to_string();
        color_dict.insert(&none_string, -1);
        color_progress.finish();

        // HashMap<DancerName, (DancerID, HashMap<PartName, (PartID, PartType)>)>
        let mut all_dancer = HashMap::new();
        let mut all_model = HashMap::new();

        let dancer_progress =
            ProgressBar::new(data_obj.dancer.len().try_into().unwrap_or_default());

        for dancer in &data_obj.dancer {
            // Create model if not exist
            let model_id = sqlx::query!(
                r#"
                    SELECT id FROM Model WHERE name = ?
                "#,
                dancer.model,
            )
            .fetch_optional(&mut *tx)
            .await
            .into_result()?;

            let model_id = match model_id {
                Some(model) => model.id,
                None => sqlx::query!(
                    r#"
                        INSERT INTO Model (name)
                        VALUES (?);
                    "#,
                    dancer.model,
                )
                .execute(&mut *tx)
                .await
                .into_result()?
                .last_insert_id() as i32,
            };

            let dancer_id = sqlx::query!(
                r#"
                    INSERT INTO Dancer (name, model_id)
                    VALUES (?, ?);
                "#,
                dancer.name,
                model_id,
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            let mut part_dict: HashMap<&String, (i32, &PartType)> = HashMap::new();
            for part in &dancer.parts {
                let type_string = match &part.r#type {
                    PartType::LED => "LED",
                    PartType::FIBER => "FIBER",
                };

                let part_id = sqlx::query!(
                    r#"
                        SELECT id FROM Part WHERE model_id = ? AND name = ?;
                    "#,
                    model_id,
                    part.name
                )
                .fetch_optional(&mut *tx)
                .await
                .into_result()?
                .map(|part| part.id);

                let part_id = match part_id {
                    Some(part) => part,
                    None => sqlx::query!(
                        r#"
                            INSERT INTO Part (model_id, name, type, length)
                            VALUES (?, ?, ?, ?);
                        "#,
                        model_id,
                        part.name,
                        type_string,
                        part.length,
                    )
                    .execute(&mut *tx)
                    .await
                    .into_result()?
                    .last_insert_id() as i32,
                };

                part_dict.insert(&part.name, (part_id, &part.r#type));
            }
            all_dancer.insert(&dancer.name, (dancer_id, part_dict.clone()));
            all_model.insert(&dancer.model, (model_id, part_dict));

            dancer_progress.inc(1);
        }
        dancer_progress.finish();

        // HashMap<LEDPartName, HashMap<EffectName, EffectID>>
        let mut led_dict: HashMap<&String, HashMap<&String, HashMap<&String, i32>>> =
            HashMap::new();
        let led_progress =
            ProgressBar::new(data_obj.led_effects.len().try_into().unwrap_or_default());

        for (model_name, dancer_effects) in &data_obj.led_effects {
            let mut model_effect_dict: HashMap<&String, HashMap<&String, i32>> = HashMap::new();

            let model = all_model
                .get(model_name)
                .ok_or("Error: Unknown Dancer Name")
                .into_result()?;

            let model_id = model.0;
            let all_part = &model.1;

            for (part_name, effects) in dancer_effects {
                let mut part_effect_dict: HashMap<&String, i32> = HashMap::new();

                let part = all_part
                    .get(part_name)
                    .ok_or("Error: Unknown Part Name")
                    .into_result()?;

                let part_id = part.0;

                for (effect_name, effect_data) in effects {
                    let effect_id = sqlx::query!(
                        r#"
                            INSERT INTO LEDEffect (name, model_id, part_id)
                            VALUES (?, ?, ?);
                        "#,
                        effect_name,
                        model_id,
                        part_id
                    )
                    .execute(&mut *tx)
                    .await
                    .into_result()?
                    .last_insert_id() as i32;

                    part_effect_dict.insert(effect_name, effect_id);

                    for (index, (color, alpha)) in effect_data.frames[0].leds.iter().enumerate() {
                        let color_id = match color_dict.get(color) {
                                Some(i) => i,
                                None => {
                                    return Err((
                                        StatusCode::BAD_REQUEST,
                                        Json(UploadDataFailedResponse {
                                            err: format!("Error: Unknown Color Name {color} in LEDEffects/{model_name}/{effect_name} at frame 0, index {index}."),
                                        }),
                                    ))
                                }
                            };
                        let _ = sqlx::query!(
                                r#"
                                    INSERT INTO LEDEffectState (effect_id, position, color_id, alpha)
                                    VALUES (?, ?, ?, ?);
                                "#,
                                effect_id,
                                index as i32,
                                color_id,
                                alpha,
                            )
                            .execute(&mut *tx)
                            .await
                            .into_result()?;
                    }
                }
                model_effect_dict.insert(part_name, part_effect_dict);
            }

            led_dict.insert(model_name, model_effect_dict);
            led_progress.inc(1);
        }
        led_progress.finish();

        let position_progress =
            ProgressBar::new(data_obj.position.len().try_into().unwrap_or_default());

        for frame_obj in data_obj.position.values() {
            if frame_obj.location.len() != data_obj.dancer.len() {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!("Error: Position frame starting at {} has invalid number of dancers. Found {}, Expected {}.",
                         frame_obj.start, frame_obj.location.len(), data_obj.dancer.len()),
                    }),
                ));
            }
            let frame_id = sqlx::query!(
                r#"
                    INSERT INTO PositionFrame (start)
                    VALUES (?);
                "#,
                frame_obj.start,
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            for (index, (location_data, rotation_data)) in frame_obj
                .location
                .iter()
                .zip(frame_obj.rotation.iter())
                .enumerate()
            {
                let dancer_id = all_dancer[&data_obj.dancer[index].name].0;

                sqlx::query!(
                    r#"
                    INSERT INTO PositionData (dancer_id, frame_id, x, y, z, rx, ry, rz)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                    "#,
                    dancer_id,
                    frame_id,
                    location_data[0],
                    location_data[1],
                    location_data[2],
                    rotation_data[0],
                    rotation_data[1],
                    rotation_data[2]
                )
                .execute(&mut *tx)
                .await
                .into_result()?;
            }
            position_progress.inc(1);
        }
        position_progress.finish();

        let control_progress =
            ProgressBar::new(data_obj.control.len().try_into().unwrap_or_default());

        for frame_obj in data_obj.control.values() {
            if frame_obj.status.len() != data_obj.dancer.len() {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!("Error: Control frame starting at {} has invalid number of dancers. Found {}, Expected {}.",
                        frame_obj.start, frame_obj.status.len(), data_obj.dancer.len()),
                    }),
                ));
            }

            let frame_id = sqlx::query!(
                r#"
                    INSERT INTO ControlFrame (start)
                    VALUES (?);
                "#,
                frame_obj.start,
                // frame_obj.fade,
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            for (i, (dancer_status, dancer_led_status)) in frame_obj
                .status
                .iter()
                .zip(frame_obj.led_status.iter())
                .enumerate()
            {
                if frame_obj.status[i].len() != data_obj.dancer[i].parts.len() {
                    return Err((
                        StatusCode::BAD_REQUEST,
                        Json(UploadDataFailedResponse {
                            err: format!("Error: Control frame starting at {}, dancer index {} has invalid number of parts. Found {}, Expected {}.",
                             frame_obj.start, i, frame_obj.status[i].len(), data_obj.dancer[i].parts.len()),
                        }),
                    ));
                };

                let dancer_name = &data_obj.dancer[i].name;
                let model_name = &data_obj.dancer[i].model;
                let real_dancer = &all_dancer[dancer_name];

                for (j, (part_status, part_led_status)) in dancer_status
                    .iter()
                    .zip(dancer_led_status.iter())
                    .enumerate()
                {
                    let part_name = &data_obj.dancer[i].parts[j].name;
                    let real_part = &real_dancer.1[part_name];

                    // ""          => effect_id =        NULL, type = "LED_BULBS"
                    // "no-change" => effect_id =        NULL, type =    "EFFECT"
                    // "<EFFECT>"  => effect_id = <EFFECT_ID>, type =    "EFFECT"

                    let r#type = match &real_part.1 {
                        PartType::FIBER => match part_status.0 {
                            Some(_) => ControlType::Color,
                            None => ControlType::NoEffect,
                        },
                        PartType::LED => {
                            match &part_status.0 {
                                Some(string) => {
                                    if string.is_empty() {
                                        ControlType::LEDBulbs
                                    } else {
                                        ControlType::Effect
                                    }
                                }
                                None => ControlType::NoEffect,
                            }
                            // LED_BULBS or EFFECT
                            // if part_status.0.is_empty() {
                            //     ControlType::LEDBulbs
                            // } else {
                            //     ControlType::Effect
                            // }
                        }
                    };

                    let type_string: String = r#type.clone().into();

                    if r#type == ControlType::NoEffect {
                        let _ = sqlx::query!(
                            r#"
                                INSERT INTO ControlData (dancer_id, part_id, frame_id, type)
                                VALUES (?, ?, ?, ?);
                            "#,
                            real_dancer.0,
                            real_part.0,
                            frame_id,
                            type_string,
                        )
                        .execute(&mut *tx)
                        .await
                        .into_result()?
                        .last_insert_id() as i32;
                    } else {
                        let color_id = color_dict.get(&part_status.0
                            .clone()
                            .ok_or("non-no effect control data should have color id (part_status.0)")
                            .into_result()?);

                        let effect_id = match led_dict.get(model_name) {
                            Some(parts_dict) => match parts_dict.get(part_name) {
                                Some(effect_dict) => effect_dict.get(&part_status.0
                                    .clone()
                                    .ok_or("non-no effect control data should have effect id (part_status.0)")
                                    .into_result()?),
                                None => None,
                            },
                            None => None,
                        };

                        let alpha = part_status.1;
                        let control_id = sqlx::query!(
                            r#"
                                INSERT INTO ControlData (dancer_id, part_id, frame_id, type, color_id, effect_id, alpha)
                                VALUES (?, ?, ?, ?, ?, ?, ?);
                            "#,
                            real_dancer.0,
                            real_part.0,
                            frame_id,
                            type_string,
                            color_id,
                            effect_id,
                            alpha,
                        )
                        .execute(&mut *tx)
                        .await
                        .into_result()?
                        .last_insert_id() as i32;
                        if r#type == ControlType::LEDBulbs {
                            for (index, (color, alpha)) in part_led_status.iter().enumerate() {
                                let color_id = match color_dict.get(color) {
                                Some(i) => i,
                                None => {
                                    return Err((
                                        StatusCode::BAD_REQUEST,
                                        Json(UploadDataFailedResponse {
                                            err: format!("Error: Unknown Color Name {color} in ControlData/{dancer_name}/{part_name} at frame {}, index {index}.", frame_obj.start),
                                        }),
                                    ))
                                }
                            };

                                sqlx::query!(
                                    r#"
                                    INSERT INTO LEDBulb (control_id, position, color_id, alpha)
                                    VALUES (?, ?, ?, ?);
                                "#,
                                    control_id,
                                    index as i32,
                                    color_id,
                                    alpha,
                                )
                                .execute(&mut *tx)
                                .await
                                .into_result()?;
                            }
                        }
                    }
                }
            }
            control_progress.inc(1);
        }
        control_progress.finish();

        // Init revision
        let _ = sqlx::query!(
            r#"
                INSERT INTO Revision (uuid)
                VALUES (?);
            "#,
            Uuid::new_v4().to_string(),
        )
        .execute(&mut *tx)
        .await
        .into_result()?;

        tx.commit().await.into_result()?;

        init_redis_control(clients.mysql_pool(), clients.redis_client())
            .await
            .expect("Error initializing redis control.");
        init_redis_position(clients.mysql_pool(), clients.redis_client())
            .await
            .expect("Error initializing redis position.");

        Ok((
            StatusCode::OK,
            Json(UploadDataResponse(
                "Data Uploaded Successfully!".to_string(),
            )),
        ))
    } else {
        Err((
            StatusCode::BAD_REQUEST,
            Json(UploadDataFailedResponse {
                err: "No File!".to_string(),
            }),
        ))
    }
}
