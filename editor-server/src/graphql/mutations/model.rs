//! Dancer mutation methods.
use crate::db::types::model::ModelData;
use crate::types::global::UserContext;

use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};

#[derive(InputObject, Default, Debug)]
pub struct ModelUpdateInput {
    pub name: String,
    pub id: i32,
}

#[derive(InputObject, Default, Debug)]
pub struct ModelCreateInput {
    pub name: String,
}

#[derive(InputObject, Default, Debug)]
pub struct ModelDeleteInput {
    pub id: i32,
}

#[derive(SimpleObject, Default, Debug)]
pub struct ModelMutationResponse {
    ok: bool,
    msg: String,
}

#[derive(Default)]
pub struct ModelMutation;

#[Object]
impl ModelMutation {
    #[allow(unused)]
    async fn add_model(
        &self,
        ctx: &Context<'_>,
        input: ModelCreateInput,
    ) -> GQLResult<ModelMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let model_name = input.name.clone();

        let raw_model = sqlx::query_as!(
            ModelData,
            r#"
                SELECT * FROM Model WHERE name = ?;
            "#,
            &model_name
        )
        .fetch_one(mysql)
        .await;

        let _dancer = match raw_model {
            Ok(dancer) => {
                return Ok(ModelMutationResponse {
                    ok: false,
                    msg: "Model already exists.".to_string(),
                });
            }
            Err(_) => sqlx::query!(
                r#"
                    INSERT INTO Model (name) VALUES (?);
                "#,
                &model_name
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
        };

        Ok(ModelMutationResponse {
            ok: true,
            msg: "Model added".to_string(),
        })
    }

    #[allow(unused)]
    async fn edit_model(
        &self,
        ctx: &Context<'_>,
        input: ModelUpdateInput,
    ) -> GQLResult<ModelMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let model_id = input.id;
        let model_name = input.name.clone();

        let raw_models = sqlx::query_as!(
            ModelData,
            r#"
                SELECT * FROM Model
                WHERE id = ?;
            "#,
            &model_id,
        )
        .fetch_one(mysql)
        .await;

        match raw_models {
            Ok(_) => {}
            Err(_) => {
                return Ok(ModelMutationResponse {
                    ok: false,
                    msg: "Model not found.".to_string(),
                })
            }
        };

        let _ = sqlx::query!(
            r#"
                UPDATE Model SET name = ?
                WHERE id = ?;
            "#,
            &model_name,
            &model_id
        )
        .execute(mysql)
        .await?;

        Ok(ModelMutationResponse {
            ok: true,
            msg: "Model updated".to_string(),
        })
    }

    #[allow(unused)]
    async fn delete_dancer(
        &self,
        ctx: &Context<'_>,
        input: ModelDeleteInput,
    ) -> GQLResult<ModelMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        let model_id = input.id;

        let raw_models = sqlx::query_as!(
            ModelData,
            r#"
                SELECT * FROM Model WHERE id = ?;
            "#,
            &model_id
        )
        .fetch_one(mysql)
        .await;

        match raw_models {
            Ok(_) => {}
            Err(_) => {
                return Ok(ModelMutationResponse {
                    ok: false,
                    msg: "Model not found.".to_string(),
                })
            }
        };

        let _ = sqlx::query!(
            r#"
                DELETE FROM Model WHERE id = ?;
            "#,
            &model_id
        )
        .execute(mysql)
        .await?;

        Ok(ModelMutationResponse {
            ok: true,
            msg: "Model deleted".to_string(),
        })
    }
}
