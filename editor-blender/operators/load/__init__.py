import bpy

from ...core.actions.state.initialize import init_load
from ...operators.async_core import AsyncOperator


class LoadPartialOperator(AsyncOperator):
    bl_idname = "lightdance.load_partial"
    bl_label = "Load frames in selected interval"

    async def async_execute(self, context: bpy.types.Context):
        # TODO
        await init_load()


class LoadOperator(AsyncOperator):
    bl_idname = "lightdance.load"
    bl_label = "Load all frames"

    async def async_execute(self, context: bpy.types.Context):
        await init_load()


def register():
    bpy.utils.register_class(LoadOperator)


def unregister():
    bpy.utils.unregister_class(LoadOperator)
