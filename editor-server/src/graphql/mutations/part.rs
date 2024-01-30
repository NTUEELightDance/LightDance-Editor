//! Part mutation methods.
use crate::db::types::{
    part::{PartType, PartData},
    dancer::DancerData,
    position_frame::PositionFrameData,
};
use crate::graphql::{
    subscriptions::dancer::{DancerPayload, DancerMutationMode},
    subscriptor::Subscriptor,
    types::dancer::Dancer
};
use crate::types::global::UserContext;
use crate::utils::data::{init_redis_control, init_redis_position};

use async_graphql::{SimpleObject, Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct PartUpdateInput {
    pub id: i32,
    pub name: String,
    pub part_type: PartType,
    pub length: Option<i32>,
}

#[derive(InputObject, Default)]
pub struct PartCreateInput {
    pub name: String,
    pub part_type: PartType,
    pub dancer_name: String,
    pub length: Option<i32>,
}

#[derive(InputObject, Default)]
pub struct PartDeleteInput {
    pub id: i32,
}

#[derive(SimpleObject, Default, Debug)]
pub struct PartResponse {
    ok: bool,
    msg: Option<String>,
    part_data: Option<PartData>,
}

#[derive(Default)]
pub struct PartMutation;

#[Object]
impl PartMutation {
    async fn add_part(
        &self,
        ctx: &Context<'_>,
        input: PartCreateInput
    ) -> GQLResult<PartResponse> {
        
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        
        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let _check = match input.part_type{
            PartType::FIBER | PartType::LED => true,
        };
        if !_check {
            return Ok(PartResponse{
                    ok: false,
                    msg: Some("Not a valid type.".to_string()),
                    part_data: None,
                })
        }

        let exist_dancer = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE name = ?;
            "#,
            input.dancer_name
        )
        .fetch_optional(mysql)
        .await?;

        match exist_dancer {
            Some(_) => {}
            None => {
                return Ok(PartResponse{
                    ok: false,
                    msg: Some("no dancer".to_string()),
                    part_data: None,
                })
            }
        }

        let exist_part = sqlx::query!(
            r#"
                SELECT * FROM Part 
                WHERE name = ?;
            "#,
            input.name
        )
        .fetch_optional(mysql)
        .await?;

        if let Some(_part) = exist_part {
            return Ok(PartResponse{
                ok: false,
                msg: Some("duplicate part".to_string()),
                part_data: None,
            })
        }

        if input.part_type == PartType::LED && (input.length.is_none() || input.length.unwrap() < 0) {
            return Ok(PartResponse{
                ok: false,
                msg: Some("length of LED part must be positive number".to_string()),
                part_data: None,
            })
        }

        let new_part_id = sqlx::query!(
            r#"
                INSERT INTO Part (dancer_id, name, type, length)
                VALUES (?, ?, ?, ?);
            "#,
            exist_dancer.clone().unwrap().id,
            input.name,
            input.part_type,
            input.length
        )
        .execute(mysql)
        .await?
        .last_insert_id() as i32;

        //TODO: for each position frame, add empty position data to the dancer
        let all_position_frames = sqlx::query_as!(
            PositionFrameData,
            r#"
                SELECT * FROM PositionFrame
                ORDER BY start ASC;
            "#
        )
        .fetch_all(mysql)
        .await?;

        let mut iter = all_position_frames.iter();
        while let Some(frame_data) = iter.next() {
            let _ = sqlx::query!(
                r#"
                    INSERT INTO PositionData (dancer_id, frame_id, x, y, z)
                    VALUES (?, ?, ?, ?, ?);
                "#,
                exist_dancer.clone().unwrap().id,
                frame_data.id.clone(),
                0,
                0,
                0
            )
            .execute(mysql)
            .await?;
        }
        //

        let _ = init_redis_control(mysql, redis).await?;
        let _ = init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Created,
            dancer_data: Some(Dancer {
                id: exist_dancer.clone().unwrap().id,
                name: exist_dancer.clone().unwrap().name,
                parts: None,             //not correct
                position_datas: None,    //not correct
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(PartResponse{
            ok: true,
            msg: Some("successfully add part".to_string()),
            part_data: Some(PartData {
                id: new_part_id,
                dancer_id: exist_dancer.clone().unwrap().id,
                name: input.name.clone(),
                r#type: input.part_type.clone(),
                length: input.length.clone()
            }),
        })
    }
    async fn delete_part(
        &self,
        ctx: &Context<'_>,
        input: PartDeleteInput
    ) -> GQLResult<PartResponse> {
        
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;
        
        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let id = input.id.clone();

        let exist_part = sqlx::query_as!(
            PartData,
            r#"
                SELECT * FROM Part WHERE id = ?;
            "#,
            id
        )
        .fetch_optional(mysql)
        .await?;

        match exist_part {
            Some(_) => {}
            None => {
                return Ok(PartResponse{
                    ok: false,
                    msg: Some("no part found".to_string()),
                    part_data: None,
                })
            }
        }

        let exist_dancer = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            exist_part.unwrap().id.clone()
        )
        .fetch_optional(mysql)
        .await?;

        let _ = sqlx::query!(
            r#"
                DELETE FROM Part
                WHERE id = ?;
            "#,
            input.id.clone()
        )
        .execute(mysql)
        .await?;

        let _ = init_redis_control(mysql, redis).await?;
        let _ = init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Deleted,
            dancer_data: Some(Dancer {
                id: exist_dancer.clone().unwrap().id,
                name: exist_dancer.clone().unwrap().name,
                parts: None,             //not correct
                position_datas: None,    //not correct
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(PartResponse{
            ok: true,
            msg: Some("successfully delete part".to_string()),
            part_data: None,
        })
    }
}