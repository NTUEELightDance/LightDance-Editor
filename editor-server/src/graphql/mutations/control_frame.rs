//! ControlFrame mutation methods.

// import types
use crate::db::types::control_frame::ControlFrameData;
use crate::db::types::editing_control_frame::EditingControlFrameData;
use crate::types::global::{PartType, UserContext};
use crate::utils::revision::update_revision;

// import modules and functions
use async_graphql::{Context, Error, FieldResult, InputObject, Object};
use std::collections::HashMap;

use crate::utils::data::{get_redis_control, update_redis_control};
use crate::utils::vector::partition_by_field;

use crate::graphql::{
    subscriptions::control_map::ControlMapPayload,
    subscriptions::control_record::{ControlRecordMutationMode, ControlRecordPayload},
    subscriptor::Subscriptor,
    types::control_data::{ControlFramesSubDatScalar, ControlFramesSubData},
};

// TODO : make the input type more consistent among the functions.
// our goal is to convert the backend from typescript into rust this year
// to avoid more trouble, we will keep the input types as they are
// but they should be unified in the future

#[derive(InputObject, Default)]
pub struct EditControlFrameInput {
    pub frame_id: i32,
    pub start: Option<i32>,
    pub fade: Option<bool>,
}

#[derive(InputObject, Default)]
pub struct DeleteControlFrameInput {
    #[graphql(name = "frameID")]
    pub frame_id: i32,
}

#[derive(Debug, sqlx::FromRow)]
pub struct DancerData {
    pub dancer_id: i32,
    pub part_type: PartType,
    pub part_id: i32,
    pub length: Option<i32>,
}

#[derive(Default)]
pub struct ControlFrameMutation;

#[Object]
impl ControlFrameMutation {
    // Add a new control frame
    async fn add_control_frame(
        &self,
        ctx: &Context<'_>,
        start: i32,
        // TODO: remove this after new api is finished
        #[allow(unused)] fade: bool,
        control_data: Vec<Vec<Vec<i32>>>,
        // [dancer][part][type, id, alpha, fade]
        led_control_data: Vec<Vec<Vec<Vec<i32>>>>,
    ) -> FieldResult<String> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        tracing::info!("Mutation: addControlFrame");

        let mut tx = mysql.begin().await?;

        // check if the control frame already exists on the start time
        let exist = sqlx::query!(
            r#"
                SELECT EXISTS (
                    SELECT 1
                    FROM ControlFrame
                    WHERE start = ?
                    LIMIT 1
                ) AS exist;
           "#,
            start
        )
        .fetch_one(&mut *tx)
        .await?
        .exist
            == 1;

        // if the control frame already exists, return error
        if exist {
            return Err(Error::new("Control frame already exists on the start time"));
        }

        // Below we check if the control data is valid when the data is given

        // we need to fetch the dancer data, ascending by dancer_id and part_id
        let raw_dancer_data = sqlx::query_as!(
            DancerData,
            r#"
                SELECT
                    Dancer.id AS "dancer_id",
                    Part.type AS "part_type: PartType",
                    Part.id AS "part_id",
                    Part.length
                FROM Dancer
                INNER JOIN Model ON Dancer.model_id = Model.id
                INNER JOIN Part ON Model.id = Part.model_id
                ORDER BY Dancer.id ASC, Part.id ASC;
            "#,
        )
        .fetch_all(&mut *tx)
        .await?;

        // Use the partition_by_field function to group raw_dancer_data by dancer_id
        let dancers: Vec<Vec<DancerData>> =
            partition_by_field(|data| data.dancer_id, raw_dancer_data);

        // the control data should be a 3d array
        // representing all the data on every parts of every dancers
        // the first dimension is the dancer id, the second dimension is the part id, and the third dimension is the data
        // the data is a 1d array of length 4

        if control_data.is_empty() || led_control_data.is_empty() {
            let error_message = "Control data is empty.".to_string();
            return Err(Error::new(error_message));
        }

        // if !control_data.is_empty() {
        // first, check if the data have all information about all dancers
        if control_data.len() != dancers.len() || led_control_data.len() != dancers.len() {
            // to avoid subtract overflow when dancers.len() < control_data.len()
            if dancers.len() < control_data.len() || dancers.len() < led_control_data.len() {
                let error_message = "Control data is more than dancers in payload.".to_string();
                return Err(Error::new(error_message));
            } else {
                let error_message = "Control data is less than dancers in payload.".to_string();
                return Err(Error::new(error_message));
            }
        }

        // fetch data about colors and LED effects
        let all_color_ids = sqlx::query!(
            r#"
                SELECT id FROM Color ORDER BY id ASC;
            "#,
        )
        .fetch_all(&mut *tx)
        .await?
        .iter()
        .map(|color_id| color_id.id)
        .collect::<Vec<i32>>();

        let all_led_effect_ids = sqlx::query!(
            r#"
                    SELECT id FROM LEDEffect ORDER BY id ASC;
                "#,
        )
        .fetch_all(&mut *tx)
        .await?
        .into_iter()
        .map(|effect_id| effect_id.id)
        .collect::<Vec<i32>>();

        let mut errors: Vec<String> = Vec::new();

        const NO_EFFECT: i32 = 0;
        const COLOR: i32 = 1;
        const EFFECT: i32 = 2;
        const LED_BULBS: i32 = 3;

        // please check the syntax of for loop in rust
        // the iter() method will return an iterator of the array
        // the enumerate() method will return a tuple of (index, value)
        for (index, data) in control_data.iter().enumerate() {
            let dancer = &dancers[index];
            let dancer_bulb_datas = &led_control_data[index];

            // second, check if the data of each dancer have all information about all parts
            if data.len() != dancer.len() || dancer_bulb_datas.len() != dancer.len() {
                if dancer.len() < data.len() || dancer.len() < dancer_bulb_datas.len() {
                    errors.push(format!(
                        "Control data in dancer {} is more than parts in payload.",
                        index + 1
                    ));
                    // if the data is more than the parts, when iter through parts will have "out of bound" error
                    // so we need to skip the rest of the iteration
                    continue;
                } else {
                    errors.push(format!(
                        "Control data in dancer {} is less than parts in payload.",
                        index + 1
                    ));
                    continue;
                }
            }

            for (part_index, part_data) in data.iter().enumerate() {
                let part = &dancer[part_index];
                let part_type = &part.part_type;

                let part_bulb_datas = &dancer_bulb_datas[part_index];
                let is_data_led_bulb = !part_bulb_datas.is_empty();

                // third, check if the data of each part have proper format
                // if !part_data.is_empty() && !part_bulb_datas.is_empty() {
                //     errors.push(format!(
                //         "There are both effect/color data and LED bulb data in dancer {} part {}.",
                //         index + 1,
                //         _index + 1
                //     ));
                //     break;
                // }
                if part_data.is_empty() && part_bulb_datas.is_empty() {
                    errors.push(format!(
                        "There are neither effect/color data or LED bulb data in dancer {} part {}.",
                        index + 1,
                        part_index + 1
                    ));
                    continue;
                }

                if !part_bulb_datas.is_empty() && part_data.is_empty() {
                    errors.push(format!(
                        "Bulb data provided but part_data is empty for dancer #{} part #{} (expected [type,id,alpha,fade])",
                        index + 1,
                        part_index + 1
                    ));
                    continue;
                }

                // check if the led_control_data is an array of length 2
                for bulb_data in part_bulb_datas.iter() {
                    if bulb_data.len() != 2 {
                        let error_message = format!(
                            "LED Bulb data of dancer #{} part #{} is not an array of length 2",
                            index + 1,
                            part_index + 1
                        );
                        errors.push(error_message);
                    }
                }

                // if part_data is an array, check if the length of the array is 4
                if !part_data.is_empty() {
                    if part_data.len() != 4 {
                        errors.push(format!(
                            "Control data of dancer #{} part #{} is not an array  of length 4 (expected: [type, id, alpha, fade])",
                            index + 1, part_index + 1
                        ));
                        continue;
                    }
                    let control_type = part_data[0];
                    let id_value = part_data[1];
                    let alpha = part_data[2];
                    let fade_value = part_data[3];

                    // check if control_type is valid
                    if control_type < 0 || control_type > 3 {
                        errors.push(format!(
                            "Invalid type value {} for dancer #{} part #{} (must be 0-3: NO_EFFECT=0, COLOR=1, EFFECT=2, LED_BULBS=3)",
                            control_type, index + 1, part_index + 1
                        ));
                        continue;
                    }

                    // check if fade_value is valid
                    if fade_value != 0 && fade_value != 1 {
                        errors.push(format!(
                            "Fade value of dancer #{} part #{} must be 0 or 1",
                            index + 1,
                            part_index + 1
                        ));
                    }
                    // For non-NO_EFFECT types, validate alpha
                    if control_type != NO_EFFECT && (alpha < 0 || alpha > 255) {
                        errors.push(format!(
                            "Alpha value of dancer #{} part #{} must be between 0 and 255",
                            index + 1,
                            part_index + 1
                        ));
                    }

                    match part_type {
                        PartType::FIBER => {
                            // only COLOR or NO_EFFECT is valid for Fiber
                            match control_type {
                                NO_EFFECT => {}
                                COLOR => {
                                    if !all_color_ids.contains(&id_value) {
                                        errors.push(format!(
                                            "Color ID {} of dancer #{} part #{} is not a valid color",
                                            id_value, index + 1, part_index + 1
                                        ));
                                    }
                                }
                                _ => {
                                    errors.push(format!(
                                        "Invalid type {} for FIBER part in dancer #{} part #{} (FIBER only supports NO_EFFECT=0 or COLOR=1)",
                                        control_type, index + 1, part_index + 1
                                    ));
                                }
                            }
                        }
                        PartType::LED => {
                            if is_data_led_bulb {
                                if control_type != LED_BULBS {
                                    errors.push(format!(
                                        "Type mismatch for dancer #{} part #{}: LED bulb data provided but type is {} (expected LED_BULBS=3)",
                                        index + 1, part_index + 1, control_type
                                    ));
                                }

                                // validate bulb count
                                if part_bulb_datas.len() != part.length.unwrap() as usize {
                                    errors.push(format!(
                                        "LED Bulb data of dancer #{} part #{} has {} bulbs but part length is {}",
                                        index + 1, part_index + 1, part_bulb_datas.len(), part.length.unwrap()
                                    ));
                                }

                                for (bulb_index, bulb_data) in part_bulb_datas.iter().enumerate() {
                                    let color_id = bulb_data[0];
                                    let bulb_alpha = bulb_data[1];

                                    if !all_color_ids.contains(&color_id)
                                        && color_id != 0
                                        && color_id != -1
                                    {
                                        errors.push(format!(
                                            "Color {} of LED Bulb #{} in dancer #{} part #{} is not a valid color",
                                            color_id, bulb_index + 1, index + 1, part_index + 1
                                        ));
                                    }
                                    if bulb_alpha < 0 || bulb_alpha > 255 {
                                        errors.push(format!(
                                            "Alpha {} of LED Bulb #{} in dancer #{} part #{} must be between 0 and 255",
                                            bulb_alpha, bulb_index + 1, index + 1, part_index + 1
                                        ));
                                    }
                                }
                            } else {
                                // only EFFECT or NO_EFFECT is valid for LED
                                match control_type {
                                    NO_EFFECT => {}
                                    EFFECT => {
                                        if !all_led_effect_ids.contains(&id_value) {
                                            errors.push(format!(
                                                "Effect ID {} of dancer #{} part #{} is not a valid effect",
                                                id_value, index + 1, part_index + 1
                                            ));
                                        }
                                    }
                                    LED_BULBS => {
                                        errors.push(format!(
                                            "Type is LED_BULBS but no bulb data provided for dancer #{} part #{}",
                                            index + 1, part_index + 1
                                        ));
                                    }
                                    COLOR => {
                                        errors.push(format!(
                                            "Invalid type COLOR for LED part in dancer #{} part #{} (LED only supports NO_EFFECT, EFFECT, or LED_BULBS)",
                                            index + 1, part_index + 1
                                        ));
                                    }
                                    _ => {
                                        errors.push(format!(
                                            "Invalid type {} for LED part in dancer #{} part #{}",
                                            control_type,
                                            index + 1,
                                            part_index + 1
                                        ));
                                    }
                                }
                            }
                        }
                    };
                }
            }
        }

        if !errors.is_empty() {
            // turn errors from Vec<String> into a string
            let errors = errors.join("\n");
            return Err(Error::new(errors));
        }

        // after checking the data, insert the data into the database

        // create a new control frame and insert it into the database
        let new_control_frame = sqlx::query!(
            r#"
                INSERT INTO ControlFrame (start)
                VALUES (?);
            "#,
            start,
        )
        .execute(&mut *tx)
        .await?;

        let new_control_frame_id = new_control_frame.last_insert_id() as i32;

        // create control frame data
        // if the control data is given, use the given data
        // if !control_data.is_empty() || !led_control_data.is_empty() {
        // iterate through every dancer
        for (index, data) in control_data.iter().enumerate() {
            let dancer = &dancers[index];
            let dancer_bulb_datas = &led_control_data[index];

            // iterate through every part of the dancer
            for (part_index, part_data) in data.iter().enumerate() {
                let dancer_id = &dancer[part_index].dancer_id;
                let part = &dancer[part_index];
                let part_bulb_datas = &dancer_bulb_datas[part_index];
                if part_data.is_empty() {
                    return Err(Error::new(format!(
                        "part_data is empty during insertion for dancer #{} part #{}",
                        index + 1,
                        part_index + 1
                    )));
                }
                let control_type = part_data[0];
                let id_value = part_data[1];
                let alpha = part_data[2];
                let fade_bool = part_data[3] == 1;
                match control_type {
                    NO_EFFECT => {
                        // store all null for fade, color_id, effect_id, alpha
                        sqlx::query!(
                            r#"
                                INSERT INTO ControlData 
                                (dancer_id, part_id, frame_id, type, fade, color_id, effect_id, alpha)
                                VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL);
                            "#,
                            dancer_id,
                            part.part_id,
                            new_control_frame_id,
                            "NO_EFFECT",
                        )
                        .execute(&mut *tx)
                        .await?;
                    }
                    COLOR => {
                        sqlx::query!(
                            r#"
                                INSERT INTO ControlData
                                (dancer_id, part_id, frame_id, type, color_id, fade, alpha)
                                VALUES (?, ?, ?, ?, ?, ?, ?);
                            "#,
                            dancer_id,
                            part.part_id,
                            new_control_frame_id,
                            "COLOR",
                            id_value,
                            fade_bool,
                            alpha,
                        )
                        .execute(&mut *tx)
                        .await?;
                    }
                    EFFECT => {
                        sqlx::query!(
                            r#"
                                INSERT INTO ControlData
                                (dancer_id, part_id, frame_id, type, effect_id, fade, alpha)
                                VALUES (?, ?, ?, ?, ?, ?, ?);
                            "#,
                            dancer_id,
                            part.part_id,
                            new_control_frame_id,
                            "EFFECT",
                            id_value,
                            fade_bool,
                            alpha,
                        )
                        .execute(&mut *tx)
                        .await?;
                    }
                    LED_BULBS => {
                        let new_control_data = sqlx::query!(
                            r#"
                                INSERT INTO ControlData
                                (dancer_id, part_id, frame_id, type, fade, alpha)
                                VALUES (?, ?, ?, ?, ?, ?);
                            "#,
                            dancer_id,
                            part.part_id,
                            new_control_frame_id,
                            "LED_BULBS",
                            fade_bool,
                            alpha,
                        )
                        .execute(&mut *tx)
                        .await?;

                        let control_id = new_control_data.last_insert_id() as i32;

                        // Insert individual bulb data
                        for (position, bulb_data) in part_bulb_datas.iter().enumerate() {
                            sqlx::query!(
                                r#"
                                    INSERT INTO LEDBulb
                                    (control_id, color_id, alpha, position)
                                    VALUES(?, ?, ?, ?);
                                "#,
                                control_id,
                                bulb_data[0],
                                bulb_data[1],
                                position as i32,
                            )
                            .execute(&mut *tx)
                            .await?;
                        }
                    }
                    _ => {
                        return Err(Error::new(format!(
                            "Invalid control type {} encountered during insertion",
                            control_type
                        )));
                    }
                }
            }
        }

        // commit the transaction
        tx.commit().await?;

        // update redis control
        update_redis_control(mysql, &clients.redis_client, new_control_frame_id).await?;
        let redis_control = get_redis_control(&clients.redis_client, new_control_frame_id).await?;
        let create_frames = HashMap::from([(new_control_frame_id.to_string(), redis_control)]);

        // below is the code for publishing control map

        // create frame
        let frame = ControlFramesSubDatScalar(ControlFramesSubData {
            create_frames,
            delete_frames: Vec::new(), // Assuming you want an empty vector for delete_list
            update_frames: HashMap::new(), // Assuming you want an empty vector for update_list
        });

        // create control map payload
        let control_map_payload = ControlMapPayload {
            frame,
            edit_by: context.user_id,
        };

        // publish control map
        Subscriptor::publish(control_map_payload);

        // below is the code for publishing control record
        // first, get the index of the new control frame

        let mut index = -1;

        // get all control frames
        let all_control_frames = sqlx::query!(
            r#"
                SELECT id
                FROM ControlFrame
                ORDER BY start ASC
            "#
        )
        .fetch_all(mysql)
        .await?;

        // get the index of the new control frame
        for (i, control_frame) in all_control_frames.iter().enumerate() {
            if control_frame.id == new_control_frame_id {
                index = i as i32;
                break;
            }
        }

        // if the index is not found, return error
        if index == -1 {
            return Err(Error::new("Index of the new control frame is not found"));
        }

        // create control map payload
        let control_record_payload = ControlRecordPayload {
            mutation: ControlRecordMutationMode::Created,
            index,
            add_id: vec![new_control_frame_id],
            update_id: vec![],
            delete_id: vec![],
            edit_by: context.user_id,
        };

        // publish control record
        Subscriptor::publish(control_record_payload);

        update_revision(mysql).await?;

        // return
        Ok("ok".to_string())
    }

    // Edit a control frame
    // the purpose of this function is to edit the start time and fade of a existing frame
    async fn edit_control_frame(
        &self,
        ctx: &Context<'_>,
        input: EditControlFrameInput,
    ) -> FieldResult<String> {
        // get the context and clients
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        tracing::info!("Mutation: editControlFrame");

        let mut tx = mysql.begin().await?;

        // get the input data
        let frame_id = input.frame_id;
        if frame_id < 0 {
            return Err(Error::new("Frame id is not valid"));
        }

        // if the start time is given, check if the new time is already been occupied by another frame
        // also check if the new time is valid
        if let Some(start) = input.start {
            // check if the new time is already been occupied by another frame

            let exist = sqlx::query!(
                r#"
                    SELECT EXISTS (
                        SELECT 1
                        FROM ControlFrame
                        WHERE start = ? AND id != ?
                        LIMIT 1
                    ) AS exist;
               "#,
                start,
                frame_id
            )
            .fetch_one(&mut *tx)
            .await?
            .exist;

            let exist_bool = exist == 1;

            // if the new time is already been occupied by another frame, return error
            if exist_bool {
                return Err(Error::new(
                    "The new time is already been occupied by another frame",
                ));
            }

            // check if the new time is valid
            if start < 0 {
                return Err(Error::new("The new time is not valid"));
            }
        }

        // check if the target frame exists
        // the bool type in mysql might have issue with rust
        let original_frame = sqlx::query_as!(
            ControlFrameData,
            r#"
                SELECT
                    id,
                    start,
                    meta_rev,
                    data_rev
                FROM ControlFrame
                WHERE id = ?
            "#,
            frame_id
        )
        .fetch_optional(&mut *tx)
        .await;

        // if the original frame is not found, return error
        let original_frame = match original_frame {
            Ok(Some(frame)) => frame,
            Ok(None) => {
                return Err(Error::new("The target frame is not found"));
            }
            Err(err) => {
                return Err(err.into());
            }
        };

        // if the target frame is being edited by other users, return error
        let is_editing = sqlx::query_as!(
            EditingControlFrameData,
            r#"
                SELECT * FROM EditingControlFrame
                WHERE frame_id = ?
                LIMIT 1;
            "#,
            frame_id,
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(editing_control_frame) = is_editing {
            let editing_user_id = editing_control_frame.user_id;

            if editing_user_id != context.user_id {
                return Err(Error::new(format!(
                    "The target frame is being edited by user #{editing_user_id}"
                )));
            }
        };

        // after checking the possible errors, we can update the frame

        // if the start time or fade is not given, keep the original frame data
        let start = if let Some(input_start) = input.start {
            input_start
        } else {
            original_frame.start
        };

        // let fade = if let Some(input_fade) = input.fade {
        //     input_fade
        // } else {
        //     original_frame.fade
        // };

        // update the frame
        sqlx::query!(
            r#"
                UPDATE ControlFrame
                SET start = ?
                WHERE id = ?;
            "#,
            start,
            frame_id
        )
        .execute(&mut *tx)
        .await?;

        // update revision of the frame
        sqlx::query!(
            r#"
                UPDATE ControlFrame
                SET meta_rev = meta_rev + 1
                WHERE id = ?;
            "#,
            frame_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        // update redis control
        update_redis_control(mysql, &clients.redis_client, frame_id).await?;
        let redis_control = get_redis_control(&clients.redis_client, frame_id).await?;
        let update_frames = HashMap::from([(frame_id.to_string(), redis_control)]);

        // below is the code for publishing control map

        // create frame
        let frame = ControlFramesSubDatScalar(ControlFramesSubData {
            create_frames: HashMap::new(), // Assuming you want an empty vector for create_list
            delete_frames: Vec::new(),     // Assuming you want an empty vector for delete_list
            update_frames,
        });

        // create control map payload
        let control_map_payload = ControlMapPayload {
            frame,
            edit_by: context.user_id,
        };

        // publish control map
        Subscriptor::publish(control_map_payload);

        // below is the code for publishing control record
        // first, get the index of the updated control frame

        let mut index = -1;

        // get all control frames
        let all_control_frames = sqlx::query!(
            r#"
                SELECT id
                FROM ControlFrame
                ORDER BY start ASC
            "#
        )
        .fetch_all(mysql)
        .await?;

        // get the index of the updated control frame
        for (i, control_frame) in all_control_frames.iter().enumerate() {
            if control_frame.id == frame_id {
                index = i as i32;
                break;
            }
        }

        // if the index is not found, return error
        if index == -1 {
            return Err(Error::new(
                "Index of the updated control frame is not found",
            ));
        }

        // create control map payload
        let control_record_payload = ControlRecordPayload {
            mutation: ControlRecordMutationMode::Updated,
            index,
            add_id: vec![],
            update_id: vec![frame_id],
            delete_id: vec![],
            edit_by: context.user_id,
        };

        // publish control record
        Subscriptor::publish(control_record_payload);

        update_revision(mysql).await?;

        // return
        Ok("ok".to_string())
    }

    // Delete a control frame
    async fn delete_control_frame(
        &self,
        ctx: &Context<'_>,
        input: DeleteControlFrameInput,
    ) -> FieldResult<String> {
        // get the context and clients
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

        tracing::info!("Mutation: deleteControlFrame");

        let mut tx = mysql.begin().await?;

        // get the input data
        let frame_id = input.frame_id;

        // if the frame id is not valid, return error
        if frame_id < 0 {
            return Err(Error::new("Frame id is not valid"));
        }

        // check if the target frame exists
        // the bool type in mysql might have issue with rust
        let original_frame = sqlx::query_as!(
            ControlFrameData,
            r#"
                SELECT
                    id,
                    start,
                    meta_rev,
                    data_rev
                FROM ControlFrame
                WHERE id = ?
            "#,
            frame_id
        )
        .fetch_optional(&mut *tx)
        .await;

        // if the original frame is not found, return error
        match original_frame {
            Ok(Some(frame)) => {
                if frame.start == 0 {
                    return Err(Error::new("The first frame can not be deleted."));
                }
            }
            Ok(None) => {
                return Err(Error::new("The target frame is not found"));
            }
            Err(err) => {
                return Err(err.into());
            }
        };

        // if the target frame is being edited by other users, return error
        let is_editing = sqlx::query_as!(
            EditingControlFrameData,
            r#"
                SELECT * FROM EditingControlFrame
                WHERE frame_id = ?
                LIMIT 1;
            "#,
            frame_id,
        )
        .fetch_optional(&mut *tx)
        .await?;

        if let Some(editing_control_frame) = is_editing {
            let editing_user_id = editing_control_frame.user_id;

            if editing_user_id != context.user_id {
                return Err(Error::new(format!(
                    "The target frame is being edited by user #{editing_user_id}"
                )));
            }
        }

        // after checking the possible errors, we can delete the frame
        sqlx::query!(
            r#"
              DELETE FROM ControlFrame
              WHERE id = ?;
            "#,
            frame_id
        )
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        // update redis control
        update_redis_control(mysql, &clients.redis_client, frame_id).await?;

        // below is the code for publishing control map

        // create frame
        let frame = ControlFramesSubDatScalar(ControlFramesSubData {
            create_frames: HashMap::new(), // Assuming you want an empty vector for create_list
            delete_frames: vec![frame_id],
            update_frames: HashMap::new(), // Assuming you want an empty vector for update_list
        });

        // create control map payload
        let control_map_payload = ControlMapPayload {
            frame,
            edit_by: context.user_id,
        };

        // publish control map
        Subscriptor::publish(control_map_payload);

        // below is the code for publishing control record

        // create control map payload
        let control_record_payload = ControlRecordPayload {
            mutation: ControlRecordMutationMode::Deleted,
            add_id: vec![],
            update_id: vec![],
            delete_id: vec![frame_id],
            edit_by: context.user_id,
            index: -1,
        };

        // publish control record
        Subscriptor::publish(control_record_payload);

        update_revision(mysql).await?;

        Ok("ok".to_string())
    }
}
