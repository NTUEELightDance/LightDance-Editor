//! RequestEdit mutation methods.

use crate::db::types::editing_control_frame::EditingControlFrameData;
use crate::db::types::{
    editing_led_effect::EditingLEDEffectData, editing_position_frame::EditingPositionFrameData,
    led_effect::LEDEffectData, position_frame::PositionFrameData,
};
use crate::types::global::UserContext;
use async_graphql::{Context, Object, Result as GQLResult, SimpleObject};

#[derive(SimpleObject, Default)]
pub struct RequestEditResponse {
    pub editing: Option<i32>,
    pub ok: bool,
}

#[derive(Default)]
pub struct RequestEditMutation;

#[Object]
impl RequestEditMutation {
    #[graphql(name = "RequestEditControl")]
    async fn request_edit_control(
        &self,
        ctx: &Context<'_>,
        frame_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let check_editing_control_frame = sqlx::query_as!(
            EditingControlFrameData,
            r#"
				SELECT * FROM EditingControlFrame
				WHERE frame_id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        let exist_frame = sqlx::query!(
            r#"
				SELECT * FROM ControlFrame
				WHERE id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        if exist_frame.is_none() {
            return Err(format!("frame id {} not found", frame_id).into());
        }

        // update EditingControlFrame
        match check_editing_control_frame {
            Some(editing) => {
                if editing.user_id != context.user_id {
                    return Ok(RequestEditResponse {
                        editing: Some(editing.user_id),
                        ok: false,
                    });
                }
                Ok(RequestEditResponse {
                    editing: Some(editing.user_id),
                    ok: true,
                })
            }
            None => {
                let _ = sqlx::query!(
                    r#"
						UPDATE EditingControlFrame 
						SET frame_id =?
						WHERE user_id = ?;
					"#,
                    frame_id,
                    context.user_id
                )
                .execute(mysql)
                .await?;
                Ok(RequestEditResponse {
                    editing: Some(context.user_id),
                    ok: true,
                })
            }
        }
    }
    #[graphql(name = "RequestEditPosition")]
    async fn request_edit_position(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "FrameID")] frame_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let check_editing_position_frame = sqlx::query_as!(
            EditingPositionFrameData,
            r#"
				SELECT * FROM EditingPositionFrame
				WHERE frame_id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        let exist_frame = sqlx::query_as!(
            PositionFrameData,
            r#"
				SELECT * FROM PositionFrame
				WHERE id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        if exist_frame.is_none() {
            return Err(format!("frame id {} not found", frame_id).into());
        }

        // update EditingPositionFrame
        match check_editing_position_frame {
            Some(editing) => {
                if editing.user_id != context.user_id {
                    return Ok(RequestEditResponse {
                        editing: Some(editing.user_id),
                        ok: false,
                    });
                }
                Ok(RequestEditResponse {
                    editing: Some(editing.user_id),
                    ok: true,
                })
            }
            None => {
                let _ = sqlx::query!(
                    r#"
						UPDATE EditingPositionFrame 
						SET frame_id =?
						WHERE user_id = ?;
					"#,
                    frame_id,
                    context.user_id
                )
                .execute(mysql)
                .await?;
                Ok(RequestEditResponse {
                    editing: Some(context.user_id),
                    ok: true,
                })
            }
        }
    }

    #[graphql(name = "RequestEditLEDEffect")]
    async fn request_edit_led_effect(
        &self,
        ctx: &Context<'_>,
        led_effect_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let check_editing_led_effect = sqlx::query_as!(
            EditingLEDEffectData,
            r#"
				SELECT * FROM EditingLEDEffect
				WHERE led_effect_id = ?;
			"#,
            led_effect_id
        )
        .fetch_optional(mysql)
        .await?;

        let exist_led_effect = sqlx::query_as!(
            LEDEffectData,
            r#"
				SELECT * FROM LEDEffect
				WHERE id = ?;
			"#,
            led_effect_id
        )
        .fetch_optional(mysql)
        .await?;
        if exist_led_effect.is_none() {
            return Err(format!("frame id {} not found", led_effect_id).into());
        }

        match check_editing_led_effect {
            Some(editing) => {
                if editing.user_id != context.user_id {
                    return Ok(RequestEditResponse {
                        editing: Some(editing.user_id),
                        ok: false,
                    });
                }
                Ok(RequestEditResponse {
                    editing: Some(editing.user_id),
                    ok: true,
                })
            }
            None => {
                let _ = sqlx::query!(
                    r#"
						UPDATE EditingLEDEffect
						SET led_effect_id =?
						WHERE user_id = ?;
					"#,
                    led_effect_id,
                    context.user_id
                )
                .execute(mysql)
                .await?;
                Ok(RequestEditResponse {
                    editing: Some(context.user_id),
                    ok: true,
                })
            }
        }
    }

    #[graphql(name = "CancelEditPosition")]
    async fn cancel_edit_position(
        &self,
        ctx: &Context<'_>,
        #[graphql(name = "FrameID")] frame_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let exist_frame = sqlx::query_as!(
            PositionFrameData,
            r#"
				SELECT * FROM PositionFrame
				WHERE id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        if exist_frame.is_none() {
            return Err(format!("frame id {} not found", frame_id).into());
        }

        let _ = sqlx::query!(
            r#"
				UPDATE EditingPositionFrame
				SET frame_id = NULL
				WHERE frame_id = ?;
			"#,
            frame_id
        )
        .execute(mysql)
        .await?;

        Ok(RequestEditResponse {
            editing: None,
            ok: true,
        })
    }

    #[graphql(name = "CancelEditControl")]
    async fn cancel_edit_control(
        &self,
        ctx: &Context<'_>,
        frame_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let exist_frame = sqlx::query!(
            r#"
				SELECT * FROM ControlFrame
				WHERE id = ?;
			"#,
            frame_id
        )
        .fetch_optional(mysql)
        .await?;

        if exist_frame.is_none() {
            return Err(format!("frame id {} not found", frame_id).into());
        }

        let _ = sqlx::query!(
            r#"
				UPDATE EditingControlFrame
				SET frame_id = NULL
				WHERE frame_id = ?;
			"#,
            frame_id
        )
        .execute(mysql)
        .await?;

        Ok(RequestEditResponse {
            editing: None,
            ok: true,
        })
    }

    #[graphql(name = "CancelEditLEDEffect")]
    async fn cancel_edit_led_effect(
        &self,
        ctx: &Context<'_>,
        led_effect_id: i32,
    ) -> GQLResult<RequestEditResponse> {
        let context = ctx.data::<UserContext>()?;
        let clients = context.clients;

        let mysql = clients.mysql_pool();
        #[allow(unused_variables)]
        let redis = clients.redis_client();

        let exist_led_effect = sqlx::query_as!(
            LEDEffectData,
            r#"
				SELECT * FROM LEDEffect
				WHERE id = ?;
			"#,
            led_effect_id
        )
        .fetch_optional(mysql)
        .await?;

        if exist_led_effect.is_none() {
            return Err(format!("frame id {} not found", led_effect_id).into());
        }

        let _ = sqlx::query!(
            r#"
				UPDATE EditingLEDEffect
				SET led_effect_id = NULL
				WHERE led_effect_id = ?;
			"#,
            led_effect_id
        )
        .execute(mysql)
        .await?;

        Ok(RequestEditResponse {
            editing: None,
            ok: true,
        })
    }
}
