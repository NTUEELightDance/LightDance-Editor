//! Dancer mutation methods.
use crate::graphql::{
    subscriptions::dancer::{DancerMutationMode, DancerPayload},
    subscriptor::Subscriptor,
    types::dancer::Dancer,
};
use crate::types::global::UserContext;

use async_graphql::{Context, InputObject, Object, Result as GQLResult, SimpleObject};

#[derive(InputObject, Default, Debug)]
pub struct DancerUpdateInput {
    pub name: String,
    pub id: i32,
}

#[derive(InputObject, Default, Debug)]
pub struct DancerCreateInput {
    pub name: String,
}

#[derive(InputObject, Default, Debug)]
pub struct DancerDeleteInput {
    pub id: i32,
}

#[derive(SimpleObject, Default, Debug)]
pub struct DancerResponse {
    ok: bool,
    msg: String,
    dancer_data: Dancer,
}

#[derive(Default)]
pub struct DancerMutation;

#[Object]
impl DancerMutation {
    async fn add_dancer(
        &self, 
        ctx: &Context<'_>, 
        input: DancerCreateInput
    ) -> GQLResult<DancerResponse> {

        //TODO : figure out redis and postion data and some stuff
        //Done : check if dancer exists, if no then insert

        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let dancer_name = input.name.clone();

        //new dancer id
        let _dancer = match sqlx::query!(
            r#"
                SELECT * FROM Dancer WHERE name = ?;
            "#,
            &dancer_name
        )
        .fetch_one(mysql)
        .await?
        {
            Ok(dancer) => {
                return Ok(DancerResponse{
                    ok: false, 
                    msg: "Dancer already exists.".to_string(),
                    dancer_data: dancer,
                })
            }
            Err(_) => sqlx::query!(
                r#"
                    INSERT INTO Dancer (name)
                    VALUES (?)
                "#,
                &dancer_name
            )
            .execute(mysql)
            .await?
            .last_insert_id() as i32,
        };

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Created,
            dancer_data: Some(Dancer {
                id: _dancer,
                name: dancer_name,
                parts: None,
                position_datas: None,
            }),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerResponse {
            ok: true,
            msg: "successfully added dancer".to_string(),
            dancer_data: Dancer {
                id: _dancer,
                name: dancer_name,
                parts: None,
                position_datas: None,
            },
        })
    }

    async fn edit_dancer(
        &self,
        ctx: &Context<'_>,
        input: DancerUpdateInput,
    ) -> GQLResult<DancerResponse> {

        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let dancer_id = input.id.clone();
        let dancer_name = input.name.clone();

        let _dancer = match sqlx::query!(
            r#"
                SELECT * FROM Dancer 
                WHERE id = ? AND name = ?;
            "#,
            &dancer_id,
            &dancer_name
        )
        .fetch_one(mysql)
        .await?
        {
            Ok(dancer) => dancer,
            Err(_) => {
                return Ok(DancerResponse{
                    ok: false, 
                    msg: "Dancer not found.".to_string(),
                    dancer_data: Dancer {
                        id: dancer_id,
                        name: dancer_name,
                        parts: None,
                        position_datas: None,
                    },
                })
            }
        };

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Updated,
            dancer_data: Some(_dancer),
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerResponse {
            ok: true,
            msg: "dancer updated".to_string(),
            dancer_data: _dancer,
        })
    }

    #[allow(unused)]
    async fn delete_dancer(
        &self, 
        ctx: &Context<'_>, 
        input: DancerDeleteInput,
    ) -> GQLResult<DancerResponse> {
        
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        let dancer_id = input.id.clone();

        let _dancer = match sqlx::query!(
            r#"
                SELECT * FROM Dancer WHERE id = ?;
            "#,
            &dancer_id
        )
        .fetch_one(mysql)
        .await?
        {
            Ok(dancer) => dancer,
            Err(_) => {
                return Ok(DancerResponse{
                    ok: false, 
                    msg: "Dancer not found.".to_string(),
                    dancer_data: Dancer {
                        id: dancer_id,
                        name: "".to_string(),
                        parts: None,
                        position_datas: None,
                    },
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

        let dancer_payload = DancerPayload {
            mutation: DancerMutationMode::Deleted,
            dancer_data: None,
            edit_by: context.user_id,
        };

        Subscriptor::publish(dancer_payload);

        Ok(DancerResponse {
            ok: true,
            msg: "dancer updated".to_string(),
            dancer_data: _dancer,
        })
    }
}