import bpy

from ...core.actions.state.initialize import init_blender
from ...operators.async_core import AsyncOperator
from ..utils import execute_operator


class SetupBlenderOperator(AsyncOperator):
    bl_idname = "lightdance.setup_blender"
    bl_label = "Necessary settings for LightDance"

    async def async_execute(self, context: bpy.types.Context):
        await init_blender()
        execute_operator("lightdance.animation_status_listener")

        return {"FINISHED"}


def register():
    bpy.utils.register_class(SetupBlenderOperator)


def unregister():
    bpy.utils.unregister_class(SetupBlenderOperator)
