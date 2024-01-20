use crate::global;

use axum::{http::StatusCode, response::Json, extract::Multipart};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use indicatif::ProgressBar;

#[derive(Debug, Deserialize, Serialize)]
struct ControlData {
    start: i32,
    fade: bool, 
    status: Vec<Vec<(String, i32)>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct PositionData {
    start: i32, 
    pos: Vec<[i32; 3]>,
}

#[derive(Debug, Deserialize, Serialize)]
struct LEDFrame {
    #[serde(rename = "LEDs")]
    leds: Vec<(String, i32)>,
    start: i32,
    fade: bool,
}
#[derive(Debug, Deserialize, Serialize)]
struct LEDPart {
    repeat: i32, 
    frames: Vec<LEDFrame>,
}

#[derive(Debug, Deserialize, Serialize)]
enum DancerPartType {
    LED,
    FIBER,
}
#[derive(Debug, Deserialize, Serialize)]
struct DancerPart {
    name: String,
    #[serde(rename = "type")]
    part_type: DancerPartType,
    length: Option<i32>,
}
#[derive(Debug, Deserialize, Serialize)]
struct Dancer {
    name: String, 
    parts: Vec<DancerPart>,
}

#[derive(Debug, Deserialize, Serialize)]
struct DataObj {
    position: HashMap<String, PositionData>,
    control: HashMap<String, ControlData>,
    dancer: Vec<Dancer>,
    color: HashMap<String, [i32; 3]>,
    #[serde(rename = "LEDEffects")]
    led_effects: HashMap<String, HashMap<String, LEDPart>>,
}

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
                })
            ))
        }
    }
}

pub async fn upload_data(
    mut files: Multipart
) -> Result<(StatusCode, Json<UploadDataResponse>), (StatusCode, Json<UploadDataFailedResponse>)> {
    // read request
    if let Some(field) = files.next_field().await.into_result()? {
        let raw_data = field.bytes().await.into_result()?;
        // parse json & check types
        let data_obj: DataObj = match serde_json::from_slice(&raw_data) {
            Ok(data_obj) => data_obj,
            Err(e) => return Err((
                StatusCode::BAD_REQUEST,
                Json(UploadDataFailedResponse {
                    err: format!("JSON was not well formatted: {e}"),
                }),
            ))
        };
        
        let app_state = global::clients::get();

        let mysql = app_state.mysql_pool();

        // Cleaner way to do this?
        let _ = sqlx::query!(r#"DELETE FROM Color"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM PositionData"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM ControlData"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM Part"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM Dancer"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM PositionFrame"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM ControlFrame"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM LEDEffect"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM LEDEffectState"#,).execute(mysql).await;
        let _ = sqlx::query!(r#"DELETE FROM EffectListData"#,).execute(mysql).await;
        println!("DB cleared");

        let mut tx = mysql.begin().await.into_result()?;
        
        // HashMap<ColorName, ColorID>
        let mut color_dict: HashMap<&String, i32> = HashMap::new();
        let color_progress = ProgressBar::new(data_obj.color.len().try_into().unwrap_or_default());
        println!("Create Colors...");
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
        color_progress.finish();

        // HashMap<LEDPartName, HashMap<EffectName, EffectID>>
        let mut led_dict: HashMap<&String, HashMap<&String, i32>> = HashMap::new();
        let led_progress = ProgressBar::new(data_obj.led_effects.len().try_into().unwrap_or_default());
        println!("Create LED Effects...");
        for (part_name, effects) in &data_obj.led_effects {
            let mut effect_dict: HashMap<&String, i32> = HashMap::new();
            for (effect_name, effect_data) in effects {
                let effect_id = sqlx::query!(
                    r#"
                        INSERT INTO LEDEffect (name, part_name)
                        VALUES (?, ?);
                    "#,
                    effect_name,
                    part_name,
                )
                .execute(&mut *tx)
                .await
                .into_result()?
                .last_insert_id() as i32;

                effect_dict.insert(effect_name, effect_id);

                // Only one frame?
                for (index, (color, alpha)) in effect_data.frames[0].leds.iter().enumerate() {
                    // What to do if color not found?
                    let color_id = match color_dict.get(color) {
                        Some(i) => i,
                        None => {
                            return Err((
                                StatusCode::BAD_REQUEST,
                                Json(UploadDataFailedResponse {
                                    err: format!("Error: Unknown Color Name {color} in LEDEffects/{part_name}/{effect_name} at frame 0, index {index}."),
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
            led_dict.insert(part_name, effect_dict);
            led_progress.inc(1);
        }
        led_progress.finish();

        // What's the point of "partsList" anyways...
        // HashMap<DancerName, (DancerID, HashMap<PartName, (PartID, PartType)>)>
        let mut all_dancer: HashMap<&String, (i32, HashMap<&String, (i32, &DancerPartType)>)> = HashMap::new();
        let dancer_progress = ProgressBar::new(data_obj.dancer.len().try_into().unwrap_or_default());
        println!("Create Dancers...");
        for dancer in &data_obj.dancer {
            let dancer_id = sqlx::query!(
                r#"
                    INSERT INTO Dancer (name)
                    VALUES (?);
                "#,
                dancer.name,
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            let mut part_dict: HashMap<&String, (i32, &DancerPartType)> = HashMap::new();
            for part in &dancer.parts {
                let type_string = match &part.part_type {
                    DancerPartType::LED => "LED",
                    DancerPartType::FIBER => "FIBER",
                };
                let part_id = sqlx::query!(
                    r#"
                        INSERT INTO Part (dancer_id, name, type, length)
                        VALUES (?, ?, ?, ?);
                    "#,
                    dancer_id,
                    part.name,
                    type_string,
                    part.length,
                )
                .execute(&mut *tx)
                .await
                .into_result()?
                .last_insert_id() as i32;

                part_dict.insert(&part.name, (part_id, &part.part_type));
            }
            all_dancer.insert(&dancer.name, (dancer_id, part_dict));
            dancer_progress.inc(1);
        }
        dancer_progress.finish();

        let position_progress = ProgressBar::new(data_obj.position.len().try_into().unwrap_or_default());
        println!("Create Position Data...");
        for (_, frame_obj) in &data_obj.position {
            if frame_obj.pos.len() != data_obj.dancer.len() {
                return Err((
                    StatusCode::BAD_REQUEST,
                    Json(UploadDataFailedResponse {
                        err: format!("Error: Position frame starting at {} has invalid number of dancers. Found {}, Expected {}.",
                         frame_obj.start, frame_obj.pos.len(), data_obj.dancer.len()),
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

            // How do I implement "withConcurrency" here?
            for (index, dancer_pos_data) in frame_obj.pos.iter().enumerate() {
                let dancer_id = all_dancer[&data_obj.dancer[index].name].0;
                let _ = sqlx::query!(
                    r#"
                        INSERT INTO PositionData (dancer_id, frame_id, x, y, z)
                        VALUES (?, ?, ?, ?, ?);
                    "#,
                    dancer_id, 
                    frame_id,
                    dancer_pos_data[0],
                    dancer_pos_data[1],
                    dancer_pos_data[2],
                )
                .execute(&mut *tx)
                .await
                .into_result()?;
            }
            position_progress.inc(1);
        }
        position_progress.finish();

        let control_progress = ProgressBar::new(data_obj.control.len().try_into().unwrap_or_default());
        println!("Create Control Data...");
        for (_, frame_obj) in &data_obj.control {
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
                    INSERT INTO ControlFrame (start, fade)
                    VALUES (?, ?);
                "#,
                frame_obj.start,
                frame_obj.fade,
            )
            .execute(&mut *tx)
            .await
            .into_result()?
            .last_insert_id() as i32;

            for (i, dancer_control_data) in frame_obj.status.iter().enumerate() {
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
                let real_dancer = &all_dancer[dancer_name];

                for (j, part_control_data) in dancer_control_data.iter().enumerate() {
                    let part_name = &data_obj.dancer[i].parts[j].name;
                    let real_part = &real_dancer.1[part_name];
                    // This is apparently wrong currently
                    let type_string = match &real_part.1 {
                        DancerPartType::LED => "EFFECT",
                        DancerPartType::FIBER => "COLOR",
                    };
                    let color_id = color_dict.get(&part_control_data.0);
                    let effect_id = match led_dict.get(part_name) {
                        Some(obj) => match obj.get(&part_control_data.0) {
                            Some(i) => Some(i),
                            None => None,
                        }, 
                        None => None,
                    };

                    if color_id == None && type_string == "COLOR" {
                        return Err((
                            StatusCode::BAD_REQUEST,
                            Json(UploadDataFailedResponse {
                                err: format!("Error: Control frame starting at {}, dancer index {}, part index {} has unknown color {}.",
                                 frame_obj.start, i, j, &part_control_data.0),
                            }),
                        ));
                    };

                    if effect_id == None && type_string == "EFFECT" {
                        return Err((
                            StatusCode::BAD_REQUEST,
                            Json(UploadDataFailedResponse {
                                err: format!("Error: Control frame starting at {}, dancer index {}, part index {} has unknown LED effect {}.",
                                 frame_obj.start, i, j, &part_control_data.0),
                            }),
                        ));
                    };

                    let alpha = part_control_data.1;

                    let _ = sqlx::query!(
                        r#"
                            INSERT INTO ControlData (part_id, frame_id, type, color_id, effect_id, alpha)
                            VALUES (?, ?, ?, ?, ?, ?);
                        "#,
                        real_part.0,
                        frame_id,
                        type_string,
                        color_id,
                        effect_id,
                        alpha,
                    )
                    .execute(&mut *tx)
                    .await
                    .into_result()?;
                }
            }
            control_progress.inc(1);
        }
        control_progress.finish();

        let _ = tx.commit().await.into_result()?;
        println!("Upload Finish!");
        Ok((StatusCode::OK, Json(UploadDataResponse("Data Uploaded Successfully!".to_string()))))
    } else {
        Err((
            StatusCode::BAD_REQUEST,
            Json(UploadDataFailedResponse {
                err: "No File!".to_string()
            }), 
        ))
    }
}
