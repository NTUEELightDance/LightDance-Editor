import bpy

from ...core.actions.state.initialize import init, reload
from ...operators.async_core import AsyncOperator


class SetupBlenderOperator(AsyncOperator):
    bl_idname = "lightdance.setup_blender"
    bl_label = "Necessary settings for LightDance"

    async def async_execute(self, context: bpy.types.Context):
        await init()


class ReloadBlenderOperator(AsyncOperator):
    bl_idname = "lightdance.reload_blender"
    bl_label = "Reload editor"

    async def async_execute(self, context: bpy.types.Context):
        await reload()


def register():
    bpy.utils.register_class(SetupBlenderOperator)
    bpy.utils.register_class(ReloadBlenderOperator)


def unregister():
    bpy.utils.unregister_class(SetupBlenderOperator)
    bpy.utils.unregister_class(ReloadBlenderOperator)
