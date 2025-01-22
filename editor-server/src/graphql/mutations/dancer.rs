//! Dancer mutation methods.
use crate::db::types::dancer::DancerData;
use crate::graphql::{
    subscriptions::dancer::{DancerMutationMode, DancerPayload},
    subscriptor::Subscriptor,
    types::dancer::Dancer,
};
use crate::types::global::UserContext;
use crate::utils::data::{init_redis_control, init_redis_position};

use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};

#[derive(InputObject, Default, Debug)]
pub struct DancerUpdateInput {
    pub name: String,
    pub id: i32,
}

#[derive(InputObject, Default, Debug)]
pub struct DancerCreateInput {
    pub name: String,
    pub model: String,
}

#[derive(InputObject, Default, Debug)]
pub struct DancerDeleteInput {
    pub id: i32,
}

#[derive(SimpleObject, Default, Debug)]
pub struct DancerMutationResponse {
    ok: bool,
    msg: String,
}

#[derive(Default)]
pub struct DancerMutation;

#[Object]
impl DancerMutation {
    #[allow(unused)]
    async fn add_dancer(
        &self,
        ctx: &Context<'_>,
        input: DancerCreateInput,
    ) -> GQLResult<DancerMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: addDancer");

        let dancer_name = input.name.clone();

        let dancer_result = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE name = ?;
            "#,
            &dancer_name
        )
        .fetch_one(mysql)
        .await;

        if let Ok(dancer) = dancer_result {
            return Ok(DancerMutationResponse {
                ok: false,
                msg: "Dancer already exists.".to_string(),
            });
        }

        let raw_model = sqlx::query!(
            r#"
                SELECT id FROM Model WHERE name = ?;
            "#,
            &input.model
        )
        .fetch_one(mysql)
        .await?;

        let dancer_id = sqlx::query!(
            r#"
                INSERT INTO Dancer (name, model_id) VALUES (?, ?);
            "#,
            &dancer_name,
            raw_model.id
        )
        .execute(mysql)
        .await?
        .last_insert_id() as i32;

        init_redis_control(mysql, redis).await?;
        init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Created,
            dancer_data: Some(Dancer {
                id: dancer_id,
                name: dancer_name,
                parts: None,
                position_datas: None,
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerMutationResponse {
            ok: true,
            msg: "Dancer added".to_string(),
        })
    }

    #[allow(unused)]
    async fn edit_dancer(
        &self,
        ctx: &Context<'_>,
        input: DancerUpdateInput,
    ) -> GQLResult<DancerMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        tracing::info!("Mutation: editDancer");

        let dancer_id = input.id;
        let dancer_name = input.name.clone();

        let raw_dancer = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            &dancer_id,
        )
        .fetch_one(mysql)
        .await;

        if raw_dancer.is_err() {
            return Ok(DancerMutationResponse {
                ok: false,
                msg: "Dancer not found.".to_string(),
            });
        }

        let dancer_id = match raw_dancer {
            Ok(dancer) => dancer,
            Err(_) => {
                return Ok(DancerMutationResponse {
                    ok: false,
                    msg: "Dancer not found.".to_string(),
                })
            }
        };

        sqlx::query!(
            r#"
                UPDATE Dancer SET name = ? WHERE id = ?;
            "#,
            &dancer_name,
            &dancer_id.id
        )
        .execute(mysql)
        .await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Updated,
            dancer_data: Some(Dancer {
                id: input.id,
                name: input.name.clone(),
                parts: None,
                position_datas: None,
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerMutationResponse {
            ok: true,
            msg: "Dancer updated".to_string(),
        })
    }

    #[allow(unused)]
    async fn delete_dancer(
        &self,
        ctx: &Context<'_>,
        input: DancerDeleteInput,
    ) -> GQLResult<DancerMutationResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        let redis = clients.redis_client();

        tracing::info!("Mutation: deleteDancer");

        let dancer_id = input.id;

        let raw_dancer = sqlx::query_as!(
            DancerData,
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            &dancer_id
        )
        .fetch_one(mysql)
        .await;

        let _dancer = match raw_dancer {
            Ok(dancer) => dancer,
            Err(_) => {
                return Ok(DancerMutationResponse {
                    ok: false,
                    msg: "Dancer not found.".to_string(),
                })
            }
        };

        let _ = sqlx::query!(
            r#"
                DELETE FROM Dancer WHERE id = ?;
            "#,
            &dancer_id
        )
        .execute(mysql)
        .await?;

        let _ = init_redis_control(mysql, redis).await?;
        let _ = init_redis_position(mysql, redis).await?;

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Deleted,
            dancer_data: None,
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerMutationResponse {
            ok: true,
            msg: "Dancer updated".to_string(),
        })
    }
}
