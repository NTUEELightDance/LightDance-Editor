//! Part mutation methods.
use crate::db::types::{model::ModelData, part::PartData, position::PositionData};
use crate::graphql::types::dancer::Part;
use crate::types::global::PartType;
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
    pub model_name: String,
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

        tracing::info!("Mutation: addPart");

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

        let exist_model = sqlx::query_as!(
            ModelData,
            r#"
                SELECT * FROM Model WHERE name = ?;
            "#,
            input.model_name
        )
        .fetch_optional(mysql)
        .await?;

        let exist_model = match exist_model {
            Some(model) => model,
            None => {
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no dancer".to_string()),
                    part_data: None,
                })
            }
        };

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
                WHERE name = ? AND model_id = ?;
            "#,
            input.name,
            exist_model.id
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

        let new_part_id = match input.part_type {
            PartType::FIBER => sqlx::query!(
                r#"
                    INSERT INTO Part (model_id, name, type)
                    VALUES (?, ?, ?);
                "#,
                exist_model.id,
                input.name,
                "FIBER"
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
            PartType::LED => sqlx::query!(
                r#"
                    INSERT INTO Part (model_id, name, type, length)
                    VALUES (?, ?, ?, ?);
                "#,
                exist_model.id,
                input.name,
                "LED",
                input
                    .length
                    .ok_or("length of LED part must be positive number")?
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
        };

        //find dancer parts
        let _all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE model_id = ?
                ORDER BY id ASC;
            "#,
            exist_model.id
        )
        .fetch_all(mysql)
        .await?;

        let _all_dancer_pos = sqlx::query_as!(
            PositionData,
            r#"
                SELECT
                    dancer_id,
                    frame_id,
                    type,
                    COALESCE(x, 0) AS x,
                    COALESCE(y, 0) AS y,
                    COALESCE(z, 0) AS z,
                    rx,
                    ry,
                    rz
                FROM PositionData
                WHERE dancer_id = ?
                ORDER BY frame_id ASC;
            "#,
            exist_model.id
        )
        .fetch_all(mysql)
        .await?;

        init_redis_control(mysql, redis).await?;
        init_redis_position(mysql, redis).await?;

        // TODO: Query all dancers and notify about the new part.
        // let dancer_payload = DancerPayload {
        //     mutation: DancerMutationMode::Updated,
        //     dancer_data: Some(Dancer {
        //         id: dancer.id,
        //         name: dancer.name.clone(),
        //         parts: Some(all_parts),
        //         position_datas: None,
        //     }),
        //     edit_by: context.user_id,
        // };
        //
        // Subscriptor::publish(dancer_payload);

        Ok(PartResponse {
            ok: true,
            msg: Some("successfully add part".to_string()),
            part_data: Some(PartData {
                id: new_part_id,
                model_id: exist_model.id,
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

        tracing::info!("Mutation: deletePart");

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

        let model_data = sqlx::query_as!(
            ModelData,
            r#"
                SELECT Model.*
                FROM Part
                INNER JOIN Model ON Part.model_id = Model.id
                WHERE Part.id = ?;
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

        //find model parts
        let _all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE model_id = ?
                ORDER BY id ASC;
            "#,
            model_data.clone().unwrap().id
        )
        .fetch_all(mysql)
        .await?;

        init_redis_control(mysql, redis).await?;
        init_redis_position(mysql, redis).await?;

        // TODO: Query all dancers and notify about the deleted part.
        // let dancer_payload = DancerPayload {
        //     mutation: DancerMutationMode::Updated,
        //     dancer_data: Some(Dancer {
        //         id: dancer.clone().unwrap().id,
        //         name: dancer.clone().unwrap().name,
        //         parts: Some(all_parts),
        //         position_datas: None,
        //     }),
        //     edit_by: context.user_id,
        // };
        //
        // Subscriptor::publish(dancer_payload);

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

        tracing::info!("Mutation: editPart");

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

        let edited_part = match edited_part {
            Some(part) => part,
            None => {
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no part found".to_string()),
                    part_data: None,
                })
            }
        };

        let model_data = sqlx::query_as!(
            ModelData,
            r#"
                SELECT * FROM Model WHERE id = ?;
            "#,
            edited_part.model_id
        )
        .fetch_optional(mysql)
        .await?;

        let model_data = match model_data {
            Some(model) => model,
            None => {
                return Ok(PartResponse {
                    ok: false,
                    msg: Some("no model found".to_string()),
                    part_data: None,
                })
            }
        };

        sqlx::query!(
            r#"
                UPDATE Part SET model_id = ?, name = ?, type = ?, length = ?
                WHERE id = ?;
            "#,
            model_data.id,
            input.name,
            input.part_type,
            input.length,
            input.id
        )
        .execute(mysql)
        .await?;

        //find dancer parts
        let _all_parts = sqlx::query_as!(
            Part,
            r#"
                SELECT * FROM Part
                WHERE model_id = ?
                ORDER BY id ASC;
            "#,
            model_data.id
        )
        .fetch_all(mysql)
        .await?;

        // TODO: Query all dancers and notify about the edited part.
        // let dancer_payload = DancerPayload {
        //     mutation: DancerMutationMode::Updated,
        //     dancer_data: Some(Dancer {
        //         id: dancer.clone().unwrap().id,
        //         name: dancer.clone().unwrap().name,
        //         parts: Some(all_parts),
        //         position_datas: Some(all_dancer_pos),
        //     }),
        //     edit_by: context.user_id,
        // };
        //
        // Subscriptor::publish(dancer_payload);

        Ok(PartResponse {
            ok: true,
            msg: Some("successfully edit part".to_string()),
            part_data: Some(PartData {
                id: input.id,
                model_id: model_data.id,
                name: input.name.clone(),
                r#type: input.part_type,
                length: input.length,
            }),
        })
    }
}
