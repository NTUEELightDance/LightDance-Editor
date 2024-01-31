//! Part mutation methods.
use crate::db::types::{
    dancer::DancerData,
    part::{PartData, PartType},
    position::PositionData,
    position_frame::PositionFrameData,
};
use crate::graphql::{
    subscriptions::dancer::{DancerMutationMode, DancerPayload},
    subscriptor::Subscriptor,
    types::dancer::{Dancer, Part},
};
use crate::types::global::UserContext;
use crate::utils::data::{init_redis_control, init_redis_position};

use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};

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
    async fn add_part(&self, ctx: &Context<'_>, input: PartCreateInput) -> GQLResult<PartResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let _check = match input.part_type {
            PartType::FIBER | PartType::LED => true,
        };
        if !_check {
            return Ok(PartResponse {
                ok: false,
                msg: Some("Not a valid type.".to_string()),
                part_data: None,
            });
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
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no dancer".to_string()),
                    part_data: None,
                })
            }
        }

        if input.part_type == PartType::LED && (input.length.is_none() || input.length.unwrap() < 0)
        {
            return Ok(PartResponse {
                ok: false,
                msg: Some("length of LED part must be positive number".to_string()),
                part_data: None,
            });
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
            return Ok(PartResponse {
                ok: false,
                msg: Some("duplicate part".to_string()),
                part_data: None,
            });
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

        let iter = all_position_frames.iter();
        for frame_data in iter {
            let _ = sqlx::query!(
                r#"
                    INSERT INTO PositionData (dancer_id, frame_id, x, y, z)
                    VALUES (?, ?, ?, ?, ?);
                "#,
                exist_dancer.clone().unwrap().id,
                frame_data.id,
                0,
                0,
                0
            )
            .execute(mysql)
            .await?;
        }

        //find dancer parts
        let all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE dancer_id = ?
                ORDER BY id ASC;
            "#,
            exist_dancer.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        let all_dancer_pos = sqlx::query_as!(
            PositionData,
            r#"
                SELECT * FROM PositionData
                WHERE dancer_id = ?
                ORDER BY frame_id ASC;
            "#,
            exist_dancer.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        init_redis_control(mysql, redis).await?;
        init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Created,
            dancer_data: Some(Dancer {
                id: exist_dancer.clone().unwrap().id,
                name: exist_dancer.clone().unwrap().name,
                parts: Some(all_parts),
                position_datas: Some(all_dancer_pos),
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(PartResponse {
            ok: true,
            msg: Some("successfully add part".to_string()),
            part_data: Some(PartData {
                id: new_part_id,
                dancer_id: exist_dancer.clone().unwrap().id,
                name: input.name.clone(),
                r#type: input.part_type,
                length: input.length,
            }),
        })
    }
    async fn delete_part(
        &self,
        ctx: &Context<'_>,
        input: PartDeleteInput,
    ) -> GQLResult<PartResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let deleted_part = sqlx::query_as!(
            PartData,
            r#"
                SELECT * FROM Part WHERE id = ?;
            "#,
            input.id
        )
        .fetch_optional(mysql)
        .await?;

        match deleted_part {
            Some(_) => {}
            None => {
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no part found".to_string()),
                    part_data: None,
                })
            }
        }

        let dancer_data = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            deleted_part.unwrap().id
        )
        .fetch_optional(mysql)
        .await?;

        let _ = sqlx::query!(
            r#"
                DELETE FROM Part
                WHERE id = ?;
            "#,
            input.id
        )
        .execute(mysql)
        .await?;

        //find dancer parts
        let all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE dancer_id = ?
                ORDER BY id ASC;
            "#,
            dancer_data.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        let all_dancer_pos = sqlx::query_as!(
            PositionData,
            r#"
                SELECT * FROM PositionData
                WHERE dancer_id = ?
                ORDER BY frame_id ASC;
            "#,
            dancer_data.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        init_redis_control(mysql, redis).await?;
        init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Deleted,
            dancer_data: Some(Dancer {
                id: dancer_data.clone().unwrap().id,
                name: dancer_data.clone().unwrap().name,
                parts: Some(all_parts),
                position_datas: Some(all_dancer_pos),
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(PartResponse {
            ok: true,
            msg: Some("successfully delete part".to_string()),
            part_data: None,
        })
    }
    async fn edit_part(
        &self,
        ctx: &Context<'_>,
        input: PartUpdateInput,
    ) -> GQLResult<PartResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let _check = match input.part_type {
            PartType::FIBER | PartType::LED => true,
        };
        if !_check {
            return Ok(PartResponse {
                ok: false,
                msg: Some("Not a valid type.".to_string()),
                part_data: None,
            });
        }

        let edited_part = sqlx::query_as!(
            PartData,
            r#"
                SELECT * FROM Part WHERE id = ?;
            "#,
            input.id
        )
        .fetch_optional(mysql)
        .await?;

        match edited_part {
            Some(_) => {}
            None => {
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no part found".to_string()),
                    part_data: None,
                })
            }
        }

        let dancer_data = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            edited_part.unwrap().id
        )
        .fetch_optional(mysql)
        .await?;

        let _ = sqlx::query!(
            r#"
                UPDATE Part SET dancer_id = ?, name = ?, type = ?, length = ?
                WHERE id = ?;
            "#,
            dancer_data.clone().unwrap().id,
            input.name,
            input.part_type,
            input.length,
            input.id
        )
        .execute(mysql)
        .await?;

        //find dancer parts
        let all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE dancer_id = ?
                ORDER BY id ASC;
            "#,
            dancer_data.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        let all_dancer_pos = sqlx::query_as!(
            PositionData,
            r#"
                SELECT * FROM PositionData
                WHERE dancer_id = ?
                ORDER BY frame_id ASC;
            "#,
            dancer_data.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Updated,
            dancer_data: Some(Dancer {
                id: dancer_data.clone().unwrap().id,
                name: dancer_data.clone().unwrap().name,
                parts: Some(all_parts),
                position_datas: Some(all_dancer_pos),
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(PartResponse {
            ok: true,
            msg: Some("successfully edit part".to_string()),
            part_data: Some(PartData {
                id: input.id,
                dancer_id: dancer_data.clone().unwrap().id,
                name: input.name.clone(),
                r#type: input.part_type,
                length: input.length,
            }),
        })
    }
}
