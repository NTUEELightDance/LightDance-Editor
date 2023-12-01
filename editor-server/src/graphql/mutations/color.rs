use crate::db::types::color::ColorData;
use crate::graphql::{
    subscriptions::color::{ColorMutationMode, ColorPayload},
    subscriptor::Subscriptor,
    types::color::Color,
};
use crate::types::global::UserContext;

use async_graphql::{Context, InputObject, Object, Result as GQLResult};

#[derive(InputObject, Default)]
pub struct ColorUpdateInput {
    pub color: String,
    pub color_code: Vec<i32>,
}

#[derive(InputObject, Default)]
pub struct ColorCreateInput {
    pub color: String,
    pub color_code: Vec<i32>,
}

#[derive(Default)]
pub struct ColorMutation;

#[Object]
impl ColorMutation {
    async fn edit_color(
        &self,
        ctx: &Context<'_>,
        id: i32,
        data: ColorUpdateInput,
    ) -> GQLResult<Color> {
        let context = ctx.data::<UserContext>()?;
        let app_state = &context.app_state;

        let mysql = app_state.mysql_pool();

        let _ = sqlx::query!(
            r#"
                UPDATE Color SET name = ?, r = ?, g = ?, b = ?
                WHERE id = ?;
            "#,
            &data.color,
            data.color_code[0],
            data.color_code[1],
            data.color_code[2],
            id
        )
        .execute(mysql)
        .await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::UPDATED,
            id,
            color: Some(data.color.clone()),
            color_code: Some(data.color_code.clone()),
            edit_by: context.user_id,
            // edit_by: 0,
        };

        Subscriptor::publish(color_payload);

        let color = Color {
            id,
            color: data.color.clone(),
            color_code: data.color_code.clone(),
        };

        Ok(color)
    }

    async fn add_color(&self, ctx: &Context<'_>, data: ColorCreateInput) -> GQLResult<Color> {
        let context = ctx.data::<UserContext>()?;
        let app_state = &context.app_state;

        let mysql = app_state.mysql_pool();

        let id = sqlx::query!(
            r#"
                INSERT INTO Color (name, r, g, b)
                VALUES (?, ?, ?, ?);
            "#,
            &data.color,
            data.color_code[0],
            data.color_code[1],
            data.color_code[2]
        )
        .execute(mysql)
        .await?
        .last_insert_id() as i32;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::CREATED,
            id,
            color: Some(data.color.clone()),
            color_code: Some(data.color_code.clone()),
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        let color = Color {
            id,
            color: data.color.clone(),
            color_code: data.color_code.clone(),
        };

        Ok(color)
    }

    #[allow(unused)]
    async fn delete_color(&self, ctx: &Context<'_>, id: i32) -> GQLResult<bool> {
        let context = ctx.data::<UserContext>()?;
        let app_state = &context.app_state;

        let mysql = app_state.mysql_pool();

        let color = sqlx::query_as!(
            ColorData,
            r#"
                SELECT * FROM Color
                WHERE id = ?;
            "#,
            id
        )
        .fetch_one(mysql)
        .await?;

        // TODO: Check if color is used in any frames

        let _ = sqlx::query!(
            r#"
                DELETE FROM Color
                WHERE id = ?;
            "#,
            id
        )
        .execute(mysql)
        .await?;

        let color_payload = ColorPayload {
            mutation: ColorMutationMode::DELETED,
            id,
            color: None,
            color_code: None,
            edit_by: context.user_id,
        };

        Subscriptor::publish(color_payload);

        Ok(true)
    }
}
