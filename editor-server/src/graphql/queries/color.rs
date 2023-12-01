use crate::db::types::color::ColorData;
use crate::graphql::types::color_map::{ColorMap, ColorMapScalar};
use crate::types::global::UserContext;

use async_graphql::{Context, Object, Result as GQLResult};

#[derive(Default)]
pub struct ColorQuery;

#[Object]
impl ColorQuery {
    async fn color_map(&self, ctx: &Context<'_>) -> GQLResult<ColorMap> {
        let context = ctx.data::<UserContext>()?;
        let app_state = &context.app_state;

        let mysql = app_state.mysql_pool();
        #[allow(unused)]
        let redis = app_state.redis_client();

        let result = sqlx::query_as!(
            ColorData,
            r#"
                SELECT * FROM Color;
            "#,
        )
        .fetch_all(mysql)
        .await?
        .into_iter()
        .map(|data| (data.id, data.into()))
        .collect();

        Ok(ColorMap {
            color_map: ColorMapScalar(result),
        })
    }
}
