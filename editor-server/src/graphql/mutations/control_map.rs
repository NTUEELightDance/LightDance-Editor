//! ControlFrame mutation methods.

// import types
use crate::db::types::editing_control_frame::EditingControlFrameData;
use crate::types::global::{PartType, UserContext};
use crate::utils::revision::update_revision;

// import modules and functions
use async_graphql::{Context, Error, FieldResult, InputObject, Object};
use std::collections::HashMap;

use crate::utils::data::{get_redis_control, update_redis_control};
use crate::utils::vector::partition_by_field;

use crate::db::types::control_data::ControlType;
use crate::graphql::{
    subscriptions::control_map::ControlMapPayload,
    subscriptor::Subscriptor,
    types::control_data::{ControlFramesSubDatScalar, ControlFramesSubData},
};

// input type
#[derive(InputObject, Default)]
pub struct EditControlMapInput {
    pub frame_id: i32,
    pub fade: Option<bool>,
    pub control_data: Option<Vec<Vec<Vec<i32>>>>,
    pub led_bulb_data: Option<Vec<Vec<Vec<Vec<i32>>>>>,
}

// query type
#[derive(Debug, sqlx::FromRow)]
pub struct DancerData {
    pub dancer_id: i32,
    pub part_type: PartType,
    pub part_id: i32,
    pub length: Option<i32>,
    pub control_data_frame_id: i32,
    pub control_id: i32,
    #[allow(dead_code)]
    pub control_type: ControlType,
}

// Mutation Object
#[derive(Default)]
pub struct ControlMapMutation;

#[Object]
impl ControlMapMutation {
    // Edit a control map
    // the purpose of this function is to edit the control data of a specific frame
    // the edit_control_frame (at control_frame.rs), however, only updates the start time and fade of a specific frame
    // the logic of this function is similar to add_control_frame (at control_frame.rs), where we need to check the validity
    // of the input data, and then insert the control data into the database

    // as mentioned in the comment of add_control_frame, the control data should be a 3d array
    // representing all the data on every part of every dancer
    // the first dimension is the dancer id, the second dimension is the part id
    // and the third dimension is the data of each Fiber or LED, depending on the part type
    // they should be a 1d array of length 2, first element representing the Color id or LEDEffect id, the second element representing the alpha value
    // if control data is of type LED_BULBS, consider replacing the effect_id with -1, or changing the input data structure altogether. The relevant data is moved to led_bulb_data.

    // For led_bulb_data, there is an extra dimension, representing the data of each LED bulb
    // the data of each LED bulb is of length 2 => [color_id, alpha].
    // if the color is not set for given LED bulb, set the color_id as -1.
    // if LED bulbs are not used for this frame, use an empty array i.e. [[[], [], ...], ...].

    async fn edit_control_map(
        &self,
        ctx: &Context<'_>,
        input: EditControlMapInput,
    ) -> FieldResult<String> {
        // get the context and clients
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        tracing::info!("Mutation: editControlMap");

        // get the input data
        let frame_id = input.frame_id;
        let control_data = input.control_data;
        let led_bulb_data = input.led_bulb_data;

        // check if the control_data is given
        let control_data = match control_data {
            Some(data) => data,
            None => {
                return Err(Error::new(
                    "Control data is not given. Please provide control data.",
                ))
            }
        };

        let led_bulb_data = match led_bulb_data {
            Some(data) => data,
            None => {
                return Err(Error::new(
                    "Control data of LED bulbs is not given. Please provide control data.",
                ))
            }
        };

        // check if the frame id is valid
        if frame_id < 0 {
            return Err(Error::new("Frame id is not valid"));
        }

        // check if the frame exists
        let is_frame_exists = sqlx::query!(
            r#"
                SELECT id FROM ControlFrame
                WHERE id = ?
                LIMIT 1;
            "#,
            frame_id,
        )
        .fetch_optional(mysql)
        .await?;

        // if the frame does not exist, return error
        if is_frame_exists.is_none() {
            return Err(Error::new(format!("Frame #{frame_id} does not exist")));
        }

        // check if the frame is being edited by others
        // fetch data from EditingControlFrame table
        let is_editing = sqlx::query_as!(
            EditingControlFrameData,
            r#"
                SELECT * FROM EditingControlFrame
                WHERE frame_id = ?
                LIMIT 1;
            "#,
            frame_id,
        )
        .fetch_optional(mysql)
        .await?;

        if let Some(editing_control_frame) = is_editing {
            let editing_user_id = editing_control_frame.user_id;

            // if the frame is being edited by others, return error
            if editing_user_id != context.user_id {
                return Err(Error::new(format!(
                    "The target frame is being edited by user #{editing_user_id}"
                )));
            }
        };

        // Below we check if the control data is valid when the data is given

        // we need to fetch the dancer data, ascending by dancer_id and part_id
        let raw_dancer_data = sqlx::query_as!(
            DancerData,
            r#"
                SELECT
                    Dancer.id AS "dancer_id",
                    Part.type AS "part_type: PartType",
                    Part.id AS "part_id",
                    Part.length,
                    ControlData.frame_id AS "control_data_frame_id",
                    ControlData.id AS "control_id",
                    ControlData.type AS "control_type: ControlType"
                FROM Dancer
                INNER JOIN Model
                    ON Dancer.model_id = Model.id
                INNER JOIN Part
                    ON Model.id = Part.model_id
                INNER JOIN ControlData
                    ON Part.id = ControlData.part_id AND
                    ControlData.dancer_id = Dancer.id
                WHERE ControlData.frame_id = ?
                ORDER BY Dancer.id ASC, Part.id ASC;
            "#,
            frame_id
        )
        .fetch_all(mysql)
        .await?;

        // Use the partition_by_field function to group raw_dancer_data by dancer_id
        let dancers = partition_by_field(|data| data.dancer_id, raw_dancer_data);

        // if dancers is empty, return error
        if dancers.is_empty() {
            return Err(Error::new(format!(
                "No dancer data is found in frame #{frame_id}"
            )));
        }

        // first, check if the data have all information about all dancers
        if control_data.len() != dancers.len() {
            // to avoid subtract overflow when dancers.len() < control_data.len()
            if dancers.len() < control_data.len() {
                let error_message = format!(
                    "Control data is more than dancers in payload. Extra number: {}",
                    control_data.len() - dancers.len()
                );
                return Err(Error::new(error_message));
            } else {
                let error_message = format!(
                    "Control data is less than dancers in payload. Missing number: {}",
                    dancers.len() - control_data.len()
                );
                return Err(Error::new(error_message));
            }
        }

        // for the following check, we need to get the data of Color and LEDEffect first
        // fetch data about colors and LED effects
        let all_color_ids = sqlx::query!(
            r#"
                SELECT id FROM Color ORDER BY id ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?
        .iter()
        .map(|color_id| color_id.id)
        .collect::<Vec<i32>>();

        let all_led_effect_ids = sqlx::query!(
            r#"
                SELECT id FROM LEDEffect ORDER BY id ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?
        .into_iter()
        .map(|effect_id| effect_id.id)
        .collect::<Vec<i32>>();

        // now, we have to iterate through each dancer
        let mut errors: Vec<String> = Vec::new();

        for (index, data) in control_data.iter().enumerate() {
            let dancer = &dancers[index];
            let led_bulb_data = &led_bulb_data[index];

            // second, check if the data of each dancer have all information about all parts
            if data.len() != dancer.len() || led_bulb_data.len() != dancer.len() {
                if dancer.len() < data.len() || dancer.len() < led_bulb_data.len() {
                    errors.push(format!(
                        "Control data in dancer {index} is more than parts in payload."
                    ));
                    // if the data is more than the parts, when iter through parts will have "out of bound" error
                    // so we need to skip the rest of the iteration
                    break;
                } else {
                    errors.push(format!(
                        "Control data in dancer {index} is less than parts in payload."
                    ));
                    break;
                }
            }

            // iterate through each part of the dancer
            for (part_index, part_data) in data.iter().enumerate() {
                let part = &dancer[part_index];
                let part_type = &part.part_type;
                let led_bulb_data = &led_bulb_data[part_index];

                // third, make sure every part has original control data (so that we can update the data)
                if part.control_data_frame_id != frame_id {
                    let error_message = format!(
                        "Dancer #{} part #{} does not have original control data in frame #{}",
                        index + 1,
                        part_index + 1,
                        frame_id
                    );
                    errors.push(error_message);
                }

                // fourth , check if the data of each part have proper format

                // if _data is not an array, return error
                if part_data.is_empty() || part_data.len() < 2 {
                    let error_message =
                        format!("Data of dancer #{index} part #{part_index} is not an array");
                    errors.push(error_message);
                }

                // check if the led_bulb_data is an array of length 2
                for bulb_data in led_bulb_data.iter() {
                    if bulb_data.len() != 2 {
                        let error_message = format!(
                            "LED Bulb data of dancer #{} part #{} is not an array of length 2",
                            index + 1,
                            part_index + 1
                        );
                        errors.push(error_message);
                    }
                }

                // if _data is an array, check if the length of the array is 2
                if part_data.len() != 2 {
                    let error_message = format!(
                        "Data of dancer #{} part #{} is not an array of length 2",
                        index + 1,
                        part_index + 1
                    );
                    errors.push(error_message.clone());
                    break;
                }

                match part_type {
                    // if the part is Fiber, check if the color is valid
                    PartType::FIBER => {
                        let color_id = part_data[0];

                        // check if the color is valid
                        if !all_color_ids.contains(&color_id) {
                            let error_message = format!(
                                "Color of dancer #{} part #{} is not a valid color",
                                index + 1,
                                part_index + 1
                            );
                            errors.push(error_message);
                        }
                    }
                    // if the part is LED, check if the effect is valid
                    PartType::LED => {
                        let effect_id = part_data[0];

                        if effect_id == 0 {
                            // LED bulbs
                            if led_bulb_data.len() != part.length.unwrap() as usize {
                                let error_message = format!(
                                        "LED Bulb data of dancer #{} part #{} is not an array of length {}",
                                        index + 1, part_index + 1, part.length.unwrap()
                                    );
                                errors.push(error_message);
                            }

                            for bulb_data in led_bulb_data.iter() {
                                let color_id = bulb_data[0];

                                // check if the color is valid
                                if !all_color_ids.contains(&color_id) && color_id != -1 {
                                    let error_message = format!(
                                            "Color of LED Bulb of dancer #{} part #{} is not a valid color",
                                            index + 1, part_index + 1
                                        );
                                    errors.push(error_message);
                                }
                            }
                        } else {
                            // LED effect
                            if effect_id > 0 && !all_led_effect_ids.contains(&effect_id) {
                                let error_message = format!(
                                    "Effect of dancer #{} part #{} is not a valid effect",
                                    index + 1,
                                    part_index + 1
                                );
                                errors.push(error_message);
                            }
                            // check if the effect is valid
                            if !all_led_effect_ids.contains(&effect_id)
                                && effect_id != -1
                                && effect_id != 0
                            {
                                let error_message = format!(
                                    "Effect of dancer #{} part #{} is not a valid effect",
                                    index + 1,
                                    part_index + 1
                                );
                                errors.push(error_message);
                            }
                        }
                    }
                };
            }
        }

        // if there are errors, return the errors
        if !errors.is_empty() {
            // turn errors from Vec<String> into a string
            let errors = errors.join("\n");
            return Err(Error::new(errors));
        }

        // after checking the data, we can finally update the data

        for (index, data) in control_data.iter().enumerate() {
            let dancer = &dancers[index];
            let led_bulb_data = &led_bulb_data[index];

            for (_index, _data) in data.iter().enumerate() {
                let dancer_id = dancer[_index].dancer_id;
                let part = &dancer[_index];
                let part_type = &part.part_type;
                let led_bulb_data = &led_bulb_data[_index];

                match part_type {
                    // if the part is Fiber, update the color and alpha
                    PartType::FIBER => {
                        let color_id = _data[0];
                        let alpha = _data[1];

                        sqlx::query!(
                            r#"
                                UPDATE ControlData
                                SET color_id = ?, alpha = ?
                                WHERE frame_id = ? AND part_id = ? AND dancer_id = ?;
                            "#,
                            color_id,
                            alpha,
                            frame_id,
                            part.part_id,
                            dancer_id,
                        )
                        .execute(mysql)
                        .await?;
                    }
                    // if the part is LED, update the effect and alpha
                    PartType::LED => {
                        let effect_id = _data[0];

                        if effect_id == 0 {
                            // LED bulbs
                            for (i, bulb_data) in led_bulb_data.iter().enumerate() {
                                let color_id = bulb_data[0];
                                let alpha = bulb_data[1];

                                // check if led bulb exists
                                let is_led_bulb_exists = sqlx::query!(
                                    r#"
                                      SELECT id FROM LEDBulb
                                      WHERE control_id = ? AND position = ?
                                    "#,
                                    part.control_id,
                                    i as i32
                                )
                                .fetch_optional(mysql)
                                .await?;

                                if is_led_bulb_exists.is_none() {
                                    // insert led bulb
                                    sqlx::query!(
                                        r#"
                                          INSERT INTO LEDBulb (control_id, position, color_id, alpha)
                                          VALUES (?, ?, ?, ?)
                                        "#,
                                        part.control_id,
                                        i as i32,
                                        color_id,
                                        alpha
                                    ).execute(mysql).await?;
                                } else {
                                    sqlx::query!(
                                        r#"
                                          UPDATE LEDBulb
                                          SET color_id = ?, alpha = ?
                                          WHERE control_id = ? AND position = ?;
                                        "#,
                                        color_id,
                                        alpha,
                                        part.control_id,
                                        i as i32
                                    )
                                    .execute(mysql)
                                    .await?;
                                }

                                sqlx::query!(
                                    r#"
                                        UPDATE ControlData
                                        SET effect_id = NULL, alpha = ?, type = "LED_BULBS"
                                        WHERE frame_id = ? AND part_id = ? AND dancer_id = ?;
                                    "#,
                                    alpha,
                                    frame_id,
                                    part.part_id,
                                    dancer_id,
                                )
                                .execute(mysql)
                                .await?;
                            }
                        } else {
                            // LED effect
                            let alpha = _data[1];

                            if effect_id > 0 {
                                sqlx::query!(
                                    r#"
                                        UPDATE ControlData
                                        SET effect_id = ?, alpha = ?, type = "EFFECT"
                                        WHERE frame_id = ? AND part_id = ? AND dancer_id = ?;
                                    "#,
                                    effect_id,
                                    alpha,
                                    frame_id,
                                    part.part_id,
                                    dancer_id,
                                )
                                .execute(mysql)
                                .await?;
                            } else {
                                sqlx::query!(
                                    r#"
                                        UPDATE ControlData
                                        SET effect_id = NULL, alpha = ?, type = "EFFECT"
                                        WHERE frame_id = ? AND part_id = ? AND dancer_id = ?;
                                    "#,
                                    alpha,
                                    frame_id,
                                    part.part_id,
                                    dancer_id,
                                )
                                .execute(mysql)
                                .await?;
                            }
                        }
                    }
                };
            }
        }

        // update revision and fade of the control frame
        sqlx::query!(
            r#"
                UPDATE ControlFrame
                SET data_rev = data_rev + 1
                WHERE id = ?;
            "#,
            frame_id,
        )
        .execute(mysql)
        .await?;

        // update redis
        update_redis_control(mysql, &clients.redis_client, frame_id).await?;
        let redis_control = get_redis_control(&clients.redis_client, frame_id).await?;
        let update_frames = HashMap::from([(frame_id.to_string(), redis_control)]);

        // publish the control map

        // create frame
        let frame = ControlFramesSubDatScalar(ControlFramesSubData {
            create_frames: HashMap::new(),
            delete_frames: Vec::new(),
            update_frames,
        });

        // create control map payload
        let control_map_payload = ControlMapPayload {
            frame,
            edit_by: context.user_id,
        };

        // publish control map
        Subscriptor::publish(control_map_payload);

        update_revision(mysql).await?;

        // TODO: check the necessity of publishing the control record (similar to the code in control_frame.rs)
        // the previous code doesn't implement this

        Ok("ok".to_string())
    }
}
