//! ControlFrame mutation methods.

// import types
use crate::db::types::control_frame::ControlFrameData;
use crate::db::types::editing_control_frame::EditingControlFrameData;
use crate::db::types::part::PartType;
use crate::types::global::UserContext;

// import modules and functions
use async_graphql::{Context, Error, FieldResult, InputObject, Object};

use crate::utils::data::update_redis_control;
use crate::utils::vector::partition_by_field;

use crate::graphql::{
    subscriptions::control_map::{ControlMapPayload, Frame},
    subscriptions::control_record::{ControlRecordMutationMode, ControlRecordPayload},
    subscriptor::Subscriptor,
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
    pub frame_id: i32,
}

#[derive(Debug, sqlx::FromRow)]
pub struct DancerData {
    pub dancer_id: i32,
    pub part_type: PartType,
    pub part_id: i32,
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
        fade: bool,
        control_data: Vec<Vec<Vec<i32>>>,
    ) -> FieldResult<String> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        let mysql = clients.mysql_pool();

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
        .fetch_one(mysql)
        .await?
        .exist;

        let exist_bool = exist == 1;

        // if the control frame already exists, return error
        if exist_bool {
            return Err(Error::new("Control frame already exists on the start time"));
        }

        // Below we check if the control data is valid when the data is given

        // we need to fetch the dancer data, ascending by dancer_id and part_id
        let raw_dancer_data: Vec<DancerData> = sqlx::query_as!(
            DancerData,
            r#"
            SELECT
              Dancer.id AS "dancer_id",
              Part.type AS "part_type: PartType",
              Part.id AS "part_id"
            FROM Dancer
            INNER JOIN Part
            ON Dancer.id = Part.dancer_id
            ORDER BY Dancer.id ASC, Part.id ASC;
          "#,
        )
        .fetch_all(mysql)
        .await?;

        // Use the partition_by_field function to group raw_dancer_data by dancer_id
        let dancers: Vec<Vec<DancerData>> =
            partition_by_field(|data| data.dancer_id, raw_dancer_data);

        // the control data should be a 3d array
        // representing all the data on every parts of every dancers
        // the first dimension is the dancer id, the second dimension is the part id, and the third dimension is the data
        // the data is a 1d array of length 2, first element representing the Color id or LEDEffect id, the second element representing the alpha value

        if !control_data.is_empty() {
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

            // fetch data about colors and LED effects
            let all_fiber_color_ids = sqlx::query!(
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

            let mut errors: Vec<String> = Vec::new();

            // please check the syntax of for loop in rust
            // the iter() method will return an iterator of the array
            // the enumerate() method will return a tuple of (index, value)
            for (index, data) in control_data.iter().enumerate() {
                let dancer = &dancers[index];

                // second, check if the data of each dancer have all information about all parts
                if data.len() != dancer.len() {
                    if dancer.len() < data.len() {
                        let error_message = format!(
                        "Control data in dancer {} is more than parts in payload. Extra number: {}",
                        index, data.len() - dancer.len()
                    );
                        errors.push(error_message);
                        // if the data is more than the parts, when iter through parts will have "out of bound" error
                        // so we need to skip the rest of the iteration
                        break;
                    } else {
                        let error_message = format!(
                        "Control data in dancer {} is less than parts in payload. Missing number: {}",
                        index, dancer.len() - data.len()
                    );
                        errors.push(error_message);
                    }
                }

                for (_index, _data) in data.iter().enumerate() {
                    let part = &dancer[_index];
                    let part_type = &part.part_type;

                    // third, check if the data of each part have proper format

                    // if _data is not an array, return error
                    if _data.is_empty() || _data.len() < 2 {
                        let error_message =
                            format!("Data of dancer #{} part #{} is not an array", index, _index);
                        errors.push(error_message);
                    }

                    // if _data is an array, check if the length of the array is 2
                    if _data.len() != 2 {
                        let error_message = format!(
                            "Data of dancer #{} part #{} is not an array of length 2",
                            index, _index
                        );
                        errors.push(error_message);
                    }

                    match part_type {
                        // if the part is Fiber, check if the color is valid
                        PartType::FIBER => {
                            let color_id = _data[0];

                            // check if the color is valid
                            if !all_fiber_color_ids.contains(&color_id) {
                                let error_message = format!(
                                    "Color of dancer #{} part #{} is not a valid color",
                                    index, _index
                                );
                                errors.push(error_message);
                            }
                        }
                        // if the part is LED, check if the effect is valid
                        PartType::LED => {
                            let effect_id = _data[0];

                            // check if the effect is valid
                            if !all_led_effect_ids.contains(&effect_id) {
                                let error_message = format!(
                                    "Effect of dancer #{} part #{} is not a valid effect",
                                    index, _index
                                );
                                errors.push(error_message);
                            }
                        }
                    };
                }
            }
            // if there are errors, return the errors
            if errors.len() > 0 {
                // turn errors from Vec<String> into a string
                let errors = errors.join("\n");
                return Err(Error::new(errors));
            }
        }

        // after checking the data, insert the data into the database

        // create a new control frame and insert it into the database
        let new_control_frame = sqlx::query!(
            r#"
                INSERT INTO ControlFrame (start, fade)
                VALUES (?, ?);
            "#,
            start,
            fade
        )
        .execute(mysql)
        .await?;

        let new_control_frame_id = new_control_frame.last_insert_id() as i32;

        // create control frame data
        // if the control data is given, use the given data
        if !control_data.is_empty() {
            // iterate through every dancer
            for (index, data) in control_data.iter().enumerate() {
                let dancer = &dancers[index];

                // iterate through every part of the dancer
                for (_index, _data) in data.iter().enumerate() {
                    let part = &dancer[_index];
                    let part_type = &part.part_type;

                    match part_type {
                        PartType::FIBER => {
                            // create a new control data and insert it into the database
                            // please refer to the schema of ControlData table
                            sqlx::query!(
                                r#"
                                  INSERT INTO ControlData 
                                  (part_id, frame_id, type, color_id, alpha)
                                  VALUES (?, ?, ?, ?, ?);
                                "#,
                                part.part_id,
                                new_control_frame_id,
                                "COLOR": ControlDataType,
                                _data[0],
                                _data[1],
                            )
                            .execute(mysql)
                            .await?;
                        }
                        PartType::LED => {
                            // create a new control data and insert it into the database
                            sqlx::query!(
                                r#"
                                  INSERT INTO ControlData 
                                  (part_id, frame_id, type, effect_id, alpha)
                                  VALUES (?, ?, ?, ?, ?);
                                "#,
                                part.part_id,
                                new_control_frame_id,
                                "EFFECT": ControlDataType,
                                _data[0],
                                _data[1],
                            )
                            .execute(mysql)
                            .await?;
                        }
                    }
                }
            }
        }
        // if the control data is not given, use the default data
        // the default data set color_id/effect_id to -1 and alpha to 0
        else {
            // iterate through every dancer
            for (_, dancer) in dancers.iter().enumerate() {
                // iterate through every part of the dancer
                for (_index, part) in dancer.iter().enumerate() {
                    let part_type = &part.part_type;

                    match part_type {
                        PartType::FIBER => {
                            // create a new control data and insert it into the database
                            // please refer to the schema of ControlData table
                            sqlx::query!(
                                r#"
                                  INSERT INTO ControlData
                                  (part_id, frame_id, type, color_id, alpha)
                                  VALUES (?, ?, ?, ?, ?);
                                "#,
                                part.part_id,
                                new_control_frame_id,
                                "COLOR": ControlDataType,
                                -1,
                                0,
                            )
                            .execute(mysql)
                            .await?;
                        }
                        PartType::LED => {
                            // create a new control data and insert it into the database
                            sqlx::query!(
                                r#"
                                  INSERT INTO ControlData
                                  (part_id, frame_id, type, effect_id, alpha)
                                  VALUES (?, ?, ?, ?, ?);
                                "#,
                                part.part_id,
                                new_control_frame_id,
                                "EFFECT": ControlDataType,
                                -1,
                                0,
                            )
                            .execute(mysql)
                            .await?;
                        }
                    }
                }
            }
        }

        // update redis control
        update_redis_control(mysql, &clients.redis_client, new_control_frame_id).await?;

        // below is the code for publishing control map

        // create frame
        let frame = Frame {
            create_list: vec![new_control_frame_id],
            delete_list: Vec::new(), // Assuming you want an empty vector for delete_list
            update_list: Vec::new(), // Assuming you want an empty vector for update_list
        };

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

        // get the input data
        let frame_id = input.frame_id;
        if frame_id < 0 {
            return Err(Error::new("Frame id is not valid"));
        }

        // if the start time is given, check if the new time is already been occupied by another frame
        // also check if the new time is valid
        if input.start.is_some() {
            let start = input.start.unwrap();

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
            .fetch_one(mysql)
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
              id, start, fade as "fade: bool"
              FROM ControlFrame
              WHERE id = ?
            "#,
            frame_id
        )
        .fetch_optional(mysql)
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
        .fetch_optional(mysql)
        .await?;

        if is_editing.is_some() {
            let editing_control_frame = is_editing.unwrap();
            let editing_user_id = editing_control_frame.user_id;

            if editing_user_id != context.user_id {
                return Err(Error::new(format!(
                    "The target frame is being edited by user #{}",
                    editing_user_id
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

        let fade = if let Some(input_fade) = input.fade {
            input_fade
        } else {
            original_frame.fade
        };

        // update the frame
        sqlx::query!(
            r#"
              UPDATE ControlFrame
              SET start = ?, fade = ?
              WHERE id = ?;
            "#,
            start,
            fade,
            frame_id
        )
        .execute(mysql)
        .await?;

        // update redis control
        update_redis_control(mysql, &clients.redis_client, frame_id).await?;

        // below is the code for publishing control map

        // create frame
        let frame = Frame {
            create_list: Vec::new(), // Assuming you want an empty vector for create_list
            delete_list: Vec::new(), // Assuming you want an empty vector for delete_list
            update_list: vec![frame_id],
        };

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
              id, start, fade as "fade: bool"
              FROM ControlFrame
              WHERE id = ?
            "#,
            frame_id
        )
        .fetch_optional(mysql)
        .await;

        // if the original frame is not found, return error
        match original_frame {
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
        .fetch_optional(mysql)
        .await?;

        if is_editing.is_some() {
            let editing_control_frame = is_editing.unwrap();
            let editing_user_id = editing_control_frame.user_id;

            if editing_user_id != context.user_id {
                return Err(Error::new(format!(
                    "The target frame is being edited by user #{}",
                    editing_user_id
                )));
            }
        };

        // after checking the possible errors, we can delete the frame
        sqlx::query!(
            r#"
              DELETE FROM ControlFrame
              WHERE id = ?;
            "#,
            frame_id
        )
        .execute(mysql)
        .await?;

        // update redis control
        update_redis_control(mysql, &clients.redis_client, frame_id).await?;

        // below is the code for publishing control map

        // create frame
        let frame = Frame {
            create_list: Vec::new(), // Assuming you want an empty vector for create_list
            delete_list: vec![frame_id],
            update_list: Vec::new(), // Assuming you want an empty vector for update_list
        };

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

        // return
        Ok("ok".to_string())
    }
}
