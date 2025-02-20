//! Dancer query methods

use crate::graphql::types::dancer::{Dancer, Part};
use crate::types::global::UserContext;
use crate::utils::vector::partition_by_field;

use async_graphql::{Context, Object, Result as GQLResult};
use itertools::Itertools;

#[derive(Default)]
pub struct DancerQuery;

#[Object]
impl DancerQuery {
    async fn dancers(&self, ctx: &Context<'_>) -> GQLResult<Vec<Dancer>> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        tracing::info!("Query: dancers");

        let result = sqlx::query!(
            r#"
                SELECT
                    Dancer.id,
                    Dancer.name,
                    Dancer.model_id,
                    Part.id as part_id,
                    Part.name as part_name,
                    Part.type as part_type,
                    Part.length as part_length
                FROM Dancer
                INNER JOIN Model ON Model.id = Dancer.model_id
                INNER JOIN Part ON Part.model_id = Model.id
                ORDER BY Dancer.id ASC, Part.id ASC;
            "#,
        )
        .fetch_all(mysql)
        .await?;

        let dancers = partition_by_field(|row| row.id, result);

        Ok(dancers
            .into_iter()
            .map(|dancer| Dancer {
                id: dancer[0].id,
                name: dancer[0].name.clone(),
                position_datas: None,
                parts: Some(
                    dancer
                        .into_iter()
                        .map(|part| Part {
                            id: part.part_id,
                            model_id: part.model_id,
                            name: part.part_name,
                            r#type: part.part_type.into(),
                            length: part.part_length,
                        })
                        .collect(),
                ),
            })
            .collect())
    }

    async fn dancer(&self, ctx: &Context<'_>, dancer_name: String) -> GQLResult<Dancer> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused)]
        let redis = clients.redis_client();

        tracing::info!("Query: dancer");

        let result = sqlx::query!(
            r#"
                SELECT
                    Dancer.id,
                    Dancer.name,
                    Dancer.model_id,
                    Part.id as part_id,
                    Part.name as part_name,
                    Part.type as part_type,
                    Part.length as part_length
                FROM Dancer
                INNER JOIN Model ON Model.id = Dancer.model_id
                INNER JOIN Part ON Part.model_id = Model.id
                WHERE Dancer.name = ?
                ORDER BY Part.id ASC;
            "#,
            dancer_name
        )
        .fetch_all(mysql)
        .await?;

        let dancers = partition_by_field(|row| row.id, result)
            .into_iter()
            .map(|dancer| Dancer {
                id: dancer[0].id,
                name: dancer[0].name.clone(),
                position_datas: None,
                parts: Some(
                    dancer
                        .into_iter()
                        .map(|part| Part {
                            id: part.part_id,
                            model_id: part.model_id,
                            name: part.part_name,
                            r#type: part.part_type.into(),
                            length: part.part_length,
                        })
                        .collect(),
                ),
            })
            .collect_vec();

        if let Some(dancer) = dancers.first() {
            Ok(dancer.clone())
        } else {
            Err("Dancer not found.".into())
        }
    }
}
