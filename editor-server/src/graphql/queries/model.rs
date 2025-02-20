//! Dancer query methods

use crate::graphql::types::model::Model;
use crate::types::global::UserContext;
use crate::utils::vector::partition_by_field;

use async_graphql::{Context, Object, Result as GQLResult};

#[derive(Default)]
pub struct ModelQuery;

#[Object]
impl ModelQuery {
    async fn models(&self, ctx: &Context<'_>) -> GQLResult<Vec<Model>> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        tracing::info!("Query: models");

        let result = sqlx::query!(
            r#"
                SELECT
                    Model.id,
                    Model.name,
                    Dancer.id AS dancer_id,
                    Dancer.name AS dancer_name
                FROM Model
                INNER JOIN Dancer ON Dancer.model_id = Model.id
                ORDER BY Model.id ASC, Dancer.id ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?;

        let models = partition_by_field(|row| row.id, result);

        Ok(models
            .into_iter()
            .map(|model| Model {
                id: model[0].id,
                name: model[0].name.clone(),
                dancers: model.into_iter().map(|row| row.dancer_name).collect(),
            })
            .collect())
    }

    async fn model(&self, ctx: &Context<'_>, model_name: String) -> GQLResult<Model> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        tracing::info!("Query: model");

        let result = sqlx::query!(
            r#"
                SELECT
                    Model.id,
                    Dancer.id AS dancer_id,
                    Dancer.name AS dancer_name
                FROM Model
                INNER JOIN Dancer ON Dancer.model_id = Model.id
                WHERE Model.name = ?
                ORDER BY Model.id ASC, Dancer.id ASC;
            "#,
            model_name
        )
        .fetch_all(mysql)
        .await?;

        if result.is_empty() {
            return Err("Model not found".into());
        }

        let id = result[0].id;

        let dancers = result.into_iter().map(|row| row.dancer_name).collect();

        Ok(Model {
            id,
            name: model_name,
            dancers,
        })
    }
}
