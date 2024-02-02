import bpy

from ...core.actions.state.auth import login, logout
from ...core.utils.notification import notify
from ...operators.async_core import AsyncOperator
from ...properties.ui.types import LoginPanelStatusType


class LoginOperator(AsyncOperator):
    bl_idname = "lightdance.login"
    bl_label = "Login"

    async def async_execute(self, context: bpy.types.Context):
        ld_ui_login: LoginPanelStatusType = getattr(
            context.window_manager, "ld_ui_login"
        )

        await login(ld_ui_login.username, ld_ui_login.password)


class LogoutOperator(AsyncOperator):
    bl_idname = "lightdance.logout"
    bl_label = "Logout"

    async def async_execute(self, context: bpy.types.Context):
        await logout()


def register():
    bpy.utils.register_class(LoginOperator)
    bpy.utils.register_class(LogoutOperator)


def unregister():
    bpy.utils.unregister_class(LoginOperator)
    bpy.utils.unregister_class(LogoutOperator)
