use std::collections::HashMap;

use crate::types::global::UserContext;
use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct GetOrderInput {
    pub dancer: String,
    pub part_type: String,
}

#[derive(Default)]
pub struct PartOrderQuery;

#[Object]
impl PartOrderQuery {
    async fn get_order(
        &self,
        ctx: &Context<'_>,
        data: GetOrderInput,
    ) -> GQLResult<HashMap<String, i32>> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();

        if !((data.part_type == "FIBER") || (data.part_type == "LED")) {
            return Err("Invalid part type, part type should be FIBER or LED".into());
        }

        let dancer_id = match sqlx::query!(
            r#"
                SELECT Dancer.id FROM Dancer
                WHERE Dancer.name = ?;
            "#,
            data.dancer
        )
        .fetch_one(mysql)
        .await
        {
            Ok(ok) => ok.id,
            Err(_) => {
                return Err("Dancer not found.".into());
            }
        };

        let order = sqlx::query!(
            r#"
                SELECT PartOrder.order, Part.name FROM PartOrder 
                INNER JOIN Part ON PartOrder.part_id = Part.id
                WHERE Part.model_id = ? AND type = ? AND user_id = ?
            "#,
            dancer_id,
            data.part_type,
            context.user_id
        )
        .fetch_all(mysql)
        .await?;

        let mut order_map: HashMap<String, i32> = HashMap::new();
        for part in order.iter() {
            order_map.insert(part.name.clone(), part.order);
        }

        Ok(order_map)
    }
}
