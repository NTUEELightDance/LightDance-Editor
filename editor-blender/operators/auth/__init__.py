import bpy

from ...core.actions.state.auth import login, logout
from ...operators.async_core import AsyncOperator
from ...properties.login import LoginPropertyGroupType


class LoginOperator(AsyncOperator):
    bl_idname = "lightdance.login"
    bl_label = "Login"

    async def async_execute(self, context: bpy.types.Context):
        ld_login: LoginPropertyGroupType = getattr(context.window_manager, "ld_login")

        success = await login(ld_login.username, ld_login.password)
        if success:
            self.report({"INFO"}, "Login successful.")
        else:
            self.report({"ERROR"}, "Login failed.")

        return {"FINISHED"}


class LogoutOperator(AsyncOperator):
    bl_idname = "lightdance.logout"
    bl_label = "Logout"

    async def async_execute(self, context: bpy.types.Context):
        success = await logout()
        if success:
            self.report({"INFO"}, "Logout successful.")
        else:
            self.report({"ERROR"}, "Logout failed.")

        return {"FINISHED"}


def register():
    bpy.utils.register_class(LoginOperator)
    bpy.utils.register_class(LogoutOperator)


def unregister():
    bpy.utils.unregister_class(LoginOperator)
    bpy.utils.unregister_class(LogoutOperator)
