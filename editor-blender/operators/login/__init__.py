import bpy

from ...core.actions.state.auth import login
from ...operators.async_core import AsyncOperator
from ...properties.login import LoginPropertyGroupType


# class LoginOperator(bpy.types.Operator):
class LoginOperator(AsyncOperator):
    bl_idname = "lightdance.login"
    bl_label = "Login"

    async def async_execute(self, context: bpy.types.Context):
        ld_login: LoginPropertyGroupType = getattr(context.window_manager, "ld_login")

        await login(ld_login.username, ld_login.password)

        # TODO: use setup operator

        return {"FINISHED"}


def register():
    bpy.utils.register_class(LoginOperator)


def unregister():
    bpy.utils.unregister_class(LoginOperator)
