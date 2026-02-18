use crate::db::types::control_data::ControlType;
use crate::global;
use crate::routes::api::{
    types::{UploadDataFailedResponse, UploadDataResponse},
    utils::IntoResult,
};
use crate::types::global::{ControlData, Dancer, JsonData, LEDPart, PartType, PositionData};
use crate::utils::data::{init_redis_control, init_redis_position};

use axum::{extract::Multipart, http::StatusCode, response::Json};
use indicatif::ProgressBar;
use sqlx::{MySql, Transaction};
use std::collections::{BTreeMap, HashMap};
use uuid::Uuid;

type UploadDataError = (StatusCode, Json<UploadDataFailedResponse>);

async fn parse_input_files(files: &mut Multipart) -> Result<JsonData, UploadDataError> {
    let mut field = match files.next_field().await.into_result()? {
        Some(field) => field,
        None => {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(UploadDataFailedResponse {
                    err: "No File!".to_string(),
                }),
            ))
        }
    };

    let mut concatenated_bytes = Vec::new();
    while let Some(chunk_data) = field.chunk().await.into_result()? {
        concatenated_bytes.extend_from_slice(&chunk_data);
    }
    let raw_data = concatenated_bytes.as_slice();
    // parse json & check types
    serde_json::from_slice(raw_data).map_err(|e| {
        (
            StatusCode::BAD_REQUEST,
            Json(UploadDataFailedResponse {
                err: format!("JSON was not well formatted: {e}"),
            }),
        )
    })
}

async fn delete_existing_data(tx: &mut Transaction<'static, MySql>) -> Result<(), UploadDataError> {
    // Cleaner way to do this?
    let _ = sqlx::query!(r#"DELETE FROM Color"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM PositionData"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM ControlData"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM Part"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM Dancer"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM PositionFrame"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM ControlFrame"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM LEDEffect"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM LEDEffectState"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM EffectListData"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM Model"#,)
        .execute(&mut **tx)
        .await;
    let _ = sqlx::query!(r#"DELETE FROM Revision"#,)
        .execute(&mut **tx)
        .await;

    Ok(())
}

/// Collect colors from the uploaded data and
/// store them as HashMap<color_name, color_id>
/// also add the pair ("none", -1)
async fn collect_colors<'a>(
    color_data: &'a BTreeMap<String, [i32; 3]>,
    tx: &mut Transaction<'static, MySql>,
    progress_bar: Option<&ProgressBar>,
    none_string: &'a String,
) -> Result<HashMap<&'a String, i32>, UploadDataError> {
    let mut color_dict: HashMap<&String, i32> = HashMap::new();
    for (color_key, color_code) in color_data {
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
        .execute(&mut **tx)
        .await
        .into_result()?
        .last_insert_id() as i32;

        color_dict.insert(color_key, color_id);
        if let Some(bar) = progress_bar {
            bar.inc(1);
        }
    }

    color_dict.insert(none_string, -1);

    if let Some(bar) = progress_bar {
        bar.finish();
    }

    Ok(color_dict)
}

/// Collect dancers and models from the
/// uploaded data and store them as
/// HashMap<&dancer_name, (dancer_id, HashMap<&part_name, (part_id, &part_type))>
/// and HashMap<&model_name, (model_id, HashMap<&part_name, (part_id, &part_type))>
async fn collect_dancers_and_models<'a>(
    dancer_data: &'a Vec<Dancer>,
    tx: &mut Transaction<'static, MySql>,
    progress_bar: Option<&'a ProgressBar>,
) -> Result<
    (
        HashMap<&'a String, (i32, HashMap<&'a String, (i32, &'a PartType)>)>,
        HashMap<&'a String, (i32, HashMap<&'a String, (i32, &'a PartType)>)>,
    ),
    UploadDataError,
> {
    // HashMap<&'a String, (i32, HashMap<&'a String, (i32, &'a PartType)>)>
    let mut all_dancer = HashMap::new();
    // HashMap<&'a String, (i32, HashMap<&'a String, (i32, &'a PartType)>)>
    let mut all_model = HashMap::new();

    for dancer in dancer_data {
        // Create model if not exist
        let model_id = sqlx::query!(
            r#"
                    SELECT id FROM Model WHERE name = ?
                "#,
            dancer.model,
        )
        .fetch_optional(&mut **tx)
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
            .execute(&mut **tx)
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
        .execute(&mut **tx)
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
            .fetch_optional(&mut **tx)
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
                .execute(&mut **tx)
                .await
                .into_result()?
                .last_insert_id() as i32,
            };

            part_dict.insert(&part.name, (part_id, &part.r#type));
        }
        all_dancer.insert(&dancer.name, (dancer_id, part_dict.clone()));
        all_model.insert(&dancer.model, (model_id, part_dict));

        if let Some(bar) = progress_bar {
            bar.inc(1);
        }
    }
    if let Some(bar) = progress_bar {
        bar.finish();
    }

    Ok((all_dancer, all_model))
}

/// Collect LEDEffects from the uploaded data and
/// store them as HashMap<&model_name, HashMap<&part_name, HashMap<&effect_name, effect_id>>>
async fn collect_led_effects<'a>(
    led_data: &'a BTreeMap<String, BTreeMap<String, BTreeMap<String, LEDPart>>>,
    tx: &mut Transaction<'static, MySql>,
    progress_bar: Option<&'a ProgressBar>,
    all_model: &'a HashMap<&'a String, (i32, HashMap<&'a String, (i32, &'a PartType)>)>,
    color_dict: &'a HashMap<&String, i32>,
) -> Result<HashMap<&'a String, HashMap<&'a String, HashMap<&'a String, i32>>>, UploadDataError> {
    let mut led_dict: HashMap<&'a String, HashMap<&'a String, HashMap<&'a String, i32>>> =
        HashMap::new();

    for (model_name, dancer_effects) in led_data {
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
                .execute(&mut **tx)
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
                            .execute(&mut **tx)
                            .await
                            .into_result()?;
                }
            }
            model_effect_dict.insert(part_name, part_effect_dict);
        }

        led_dict.insert(model_name, model_effect_dict);

        if let Some(bar) = progress_bar {
            bar.inc(1);
        }
    }

    if let Some(bar) = progress_bar {
        bar.finish();
    }

    Ok(led_dict)
}

async fn check_position_data_shape(
    position_data: &BTreeMap<String, PositionData>,
    dancer_data: &[Dancer],
) -> Result<(), UploadDataError> {
    for frame_obj in position_data.values() {
        if frame_obj.location.len() != dancer_data.len() {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(UploadDataFailedResponse {
                    err: format!(
                        "Error: Position frame starting at {}
                        has invalid number of dancers. Found {}, Expected {}.",
                        frame_obj.start,
                        frame_obj.location.len(),
                        dancer_data.len()
                    ),
                }),
            ));
        }
    }

    Ok(())
}

async fn collect_position(
    position_data: &BTreeMap<String, PositionData>,
    tx: &mut Transaction<'static, MySql>,
    progress_bar: Option<&ProgressBar>,
    all_dancer: &HashMap<&String, (i32, HashMap<&String, (i32, &PartType)>)>,
    dancer_data: &[Dancer],
) -> Result<(), UploadDataError> {
    for frame_obj in position_data.values() {
        let frame_id = sqlx::query!(
            r#"
                    INSERT INTO PositionFrame (start)
                    VALUES (?);
                "#,
            frame_obj.start,
        )
        .execute(&mut **tx)
        .await
        .into_result()?
        .last_insert_id() as i32;

        for (index, ((location_data, rotation_data), has_position)) in frame_obj
            .location
            .iter()
            .zip(frame_obj.rotation.iter())
            .zip(frame_obj.has_position.iter())
            .enumerate()
        {
            // TODO: add proper error handling
            let dancer_id = all_dancer[&dancer_data[index].name].0;
            let r#type = match has_position {
                true => "POSITION",
                false => "NO_EFFECt",
            };

            sqlx::query!(
                r#"
                    INSERT INTO PositionData (dancer_id, frame_id, type, x, y, z, rx, ry, rz)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
                    "#,
                dancer_id,
                frame_id,
                r#type,
                location_data[0],
                location_data[1],
                location_data[2],
                rotation_data[0],
                rotation_data[1],
                rotation_data[2]
            )
            .execute(&mut **tx)
            .await
            .into_result()?;
        }

        if let Some(bar) = progress_bar {
            bar.inc(1);
        }
    }
    if let Some(bar) = progress_bar {
        bar.finish()
    }

    Ok(())
}

async fn check_control_data_shape(
    control_data: &BTreeMap<String, ControlData>,
    dancer_data: &[Dancer],
) -> Result<(), UploadDataError> {
    for frame_obj in control_data.values() {
        if frame_obj.status.len() != dancer_data.len() {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(UploadDataFailedResponse {
                    err: format!(
                        "Error: Control frame starting at {} has
                        invalid number of dancers. Found {}, Expected {}.",
                        frame_obj.start,
                        frame_obj.status.len(),
                        dancer_data.len()
                    ),
                }),
            ));
        }
    }

    Ok(())
}

async fn collect_control_data(
    tx: &mut Transaction<'static, MySql>,
    progress_bar: Option<&ProgressBar>,
    control_data: &BTreeMap<String, ControlData>,
    dancer_data: &[Dancer],
    all_dancer: &HashMap<&String, (i32, HashMap<&String, (i32, &PartType)>)>,
    color_dict: &HashMap<&String, i32>,
    led_dict: &HashMap<&String, HashMap<&String, HashMap<&String, i32>>>,
) -> Result<(), UploadDataError> {
    for frame_obj in control_data.values() {
        let frame_id = sqlx::query!(
            r#"
                    INSERT INTO ControlFrame (start)
                    VALUES (?);
                "#,
            frame_obj.start,
        )
        .execute(&mut **tx)
        .await
        .into_result()?
        .last_insert_id() as i32;

        for (i, (dancer_status, dancer_led_status)) in frame_obj
            .status
            .iter()
            .zip(frame_obj.led_status.iter())
            .enumerate()
        {
            if frame_obj.status[i].len() != dancer_data[i].parts.len() {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!(
                            "Error: Control frame starting at {},
                            dancer index {} has invalid number of parts.
                            Found {}, Expected {}.",
                            frame_obj.start,
                            i,
                            frame_obj.status[i].len(),
                            dancer_data[i].parts.len()
                        ),
                    }),
                ));
            };

            let dancer_name = &dancer_data[i].name;
            let model_name = &dancer_data[i].model;
            let real_dancer = &all_dancer[dancer_name];

            if dancer_status.len() != dancer_led_status.len() {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!(
                            "Error: Fields status and led_status has different length in frame
                                     starting at {} for dancer {}. Length of status is {} but length
                                     of led_status is {} ",
                            frame_obj.start,
                            dancer_name,
                            dancer_status.len(),
                            dancer_led_status.len()
                        ),
                    }),
                ));
            }

            for (j, (part_status, part_led_status)) in dancer_status
                .iter()
                .zip(dancer_led_status.iter())
                .enumerate()
            {
                let part_name = &dancer_data[i].parts[j].name;
                let real_part = &real_dancer.1[part_name];
                let part_fade = frame_obj.fade[i];
                let part_has_effect = frame_obj.has_effect[i];

                // ""          => effect_id =        NULL, type = "LED_BULBS"
                // "no-change" => effect_id =        NULL, type =    "EFFECT"
                // "<EFFECT>"  => effect_id = <EFFECT_ID>, type =    "EFFECT"

                // TODO: add error handling for the dirty code below
                let r#type = if !part_has_effect {
                    ControlType::NoEffect
                } else {
                    match &real_part.1 {
                        PartType::FIBER => ControlType::Color,
                        PartType::LED => {
                            if part_status.0.is_empty() {
                                ControlType::LEDBulbs
                            } else {
                                ControlType::Effect
                            }
                        }
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
                    .execute(&mut **tx)
                    .await
                    .into_result()?
                    .last_insert_id() as i32;
                } else {
                    let color_id = color_dict.get(&part_status.0);

                    let effect_id = match led_dict.get(model_name) {
                        Some(parts_dict) => match parts_dict.get(part_name) {
                            Some(effect_dict) => effect_dict.get(&part_status.0),
                            None => None,
                        },
                        None => None,
                    };

                    let alpha = part_status.1;
                    let control_id = sqlx::query!(
                            r#"
                                INSERT INTO ControlData (dancer_id, part_id, frame_id, type, color_id, effect_id, alpha, fade)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                            "#,
                            real_dancer.0,
                            real_part.0,
                            frame_id,
                            type_string,
                            color_id,
                            effect_id,
                            alpha,
                            part_fade,
                        )
                        .execute(&mut **tx)
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
                                                err: format!(
                                                         "Error: Unknown Color Name {color} in ControlData /{dancer_name}/{part_name} at frame {}, index {index}.",
                                                         frame_obj.start),
                                            }),
                                        ));
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
                            .execute(&mut **tx)
                            .await
                            .into_result()?;
                        }
                    }
                }
            }
        }
        if let Some(bar) = progress_bar {
            bar.inc(1)
        }
    }

    if let Some(bar) = progress_bar {
        bar.finish();
    }

    Ok(())
}

pub async fn upload_data(
    mut files: Multipart,
) -> Result<(StatusCode, Json<UploadDataResponse>), (StatusCode, Json<UploadDataFailedResponse>)> {
    // read request
    let data_obj = parse_input_files(&mut files).await?;

    let clients = global::clients::get();
    let mysql_pool = clients.mysql_pool();
    let mut tx = mysql_pool.begin().await.into_result()?;

    delete_existing_data(&mut tx).await?;

    // HashMap<ColorName, ColorID>
    let none_string = "none".to_string();
    let color_progress = ProgressBar::new(data_obj.color.len().try_into().unwrap_or_default());
    let color_dict = collect_colors(
        &data_obj.color,
        &mut tx,
        Some(&color_progress),
        &none_string,
    )
    .await?;

    let dancer_progress = ProgressBar::new(data_obj.dancer.len().try_into().unwrap_or_default());

    let (all_dancer, all_model) =
        collect_dancers_and_models(&data_obj.dancer, &mut tx, Some(&dancer_progress)).await?;

    // HashMap<LEDPartName, HashMap<EffectName, EffectID>>
    let led_progress = ProgressBar::new(data_obj.led_effects.len().try_into().unwrap_or_default());
    let led_dict = collect_led_effects(
        &data_obj.led_effects,
        &mut tx,
        Some(&led_progress),
        &all_model,
        &color_dict,
    )
    .await?;

    let position_progress =
        ProgressBar::new(data_obj.position.len().try_into().unwrap_or_default());

    check_position_data_shape(&data_obj.position, &data_obj.dancer).await?;

    collect_position(
        &data_obj.position,
        &mut tx,
        Some(&position_progress),
        &all_dancer,
        &data_obj.dancer,
    )
    .await?;

    let control_progress = ProgressBar::new(data_obj.control.len().try_into().unwrap_or_default());

    check_control_data_shape(&data_obj.control, &data_obj.dancer).await?;

    collect_control_data(
        &mut tx,
        Some(&control_progress),
        &data_obj.control,
        &data_obj.dancer,
        &all_dancer,
        &color_dict,
        &led_dict,
    )
    .await?;

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
}
