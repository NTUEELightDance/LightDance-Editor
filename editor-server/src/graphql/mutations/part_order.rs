use std::collections::HashMap;

use crate::types::global::UserContext;
use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct OrderUpdateInput {
    pub dancer: String,
    pub part_type: String,
    pub order: HashMap<String, i32>,
}

#[derive(Default)]
pub struct PartOrderMutation;

#[Object]
impl PartOrderMutation {
    async fn edit_order(
        &self,
        ctx: &Context<'_>,
        data: OrderUpdateInput,
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

        // query part order
        let _order = sqlx::query!(
            r#"
                SELECT PartOrder.order, Part.id FROM PartOrder 
                INNER JOIN Part ON PartOrder.part_id = Part.id
                WHERE Part.model_id = ? AND type = ? AND user_id = ?
            "#,
            dancer_id,
            data.part_type,
            context.user_id
        )
        .fetch_all(mysql)
        .await?;

        // create hashmap for part
        let parts = sqlx::query!(
            r#"
                SELECT Part.id, Part.name FROM Part
                WHERE Part.model_id = ? AND type = ?
                ORDER BY Part.id ASC;
            "#,
            dancer_id,
            data.part_type
        )
        .fetch_all(mysql)
        .await?;

        let mut part_map: HashMap<String, i32> = HashMap::new();

        for part in parts.iter() {
            part_map.insert(part.name.clone(), part.id);
        }

        // check if all part names are valid, if so, update order
        for (part_name, order) in data.order.iter() {
            let part_id = match part_map.get(part_name) {
                Some(part_id) => part_id,
                None => {
                    return Err(format!("Invalid part name {}", part_name).into());
                }
            };
            let _ = sqlx::query!(
                r#"
                    UPDATE PartOrder
                    SET `order` = ?
                    WHERE part_id = ? AND user_id = ?;
                "#,
                order,
                part_id,
                context.user_id
            )
            .execute(mysql)
            .await?;
        }

        Ok(data.order)
    }
}
