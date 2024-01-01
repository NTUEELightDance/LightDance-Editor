import bpy
import asyncio

from ...core.states import states
from ...api import authAgent

from ...properties.login import LoginPropertyGroup
from ...operators.async_core import AsyncOperator


# class LoginOperator(bpy.types.Operator):
class LoginOperator(AsyncOperator):
    bl_idname = "lightdance.login"
    bl_label = "Login"

    async def async_execute(self, context: bpy.types.Context):
        login: LoginPropertyGroup = getattr(
            context.window_manager, "ld_login")

        login_result = await authAgent.login(
            username=login.username,
            password=login.password,
        )
        print(login_result)

        return {'FINISHED'}


def register():
    bpy.utils.register_class(LoginOperator)


def unregister():
    bpy.utils.unregister_class(LoginOperator)
