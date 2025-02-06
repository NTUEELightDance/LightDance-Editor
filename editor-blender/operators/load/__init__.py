import bpy

from ...core.actions.property.partial_load import (
    init_show_dancer,
    set_loaded_frame_at_full_range,
    set_state_of_dancer_selection,
    set_state_of_loaded_frame_range,
)
from ...core.actions.state.initialize import init_load
from ...operators.async_core import AsyncOperator


# import state
class LoadPartialOperator(AsyncOperator):
    bl_idname = "lightdance.load_partial"
    bl_label = "Load frames for selected dancers"
    # bl_label = "Load frames in selected interval"

    async def async_execute(self, context: bpy.types.Context):
        # TODO
        set_state_of_dancer_selection()
        set_state_of_loaded_frame_range()
        await init_load()


class LoadOperator(AsyncOperator):
    bl_idname = "lightdance.load"
    bl_label = "Load all frames"

    async def async_execute(self, context: bpy.types.Context):
        init_show_dancer()
        set_loaded_frame_at_full_range()
        await init_load()


def register():
    bpy.utils.register_class(LoadOperator)
    bpy.utils.register_class(LoadPartialOperator)


def unregister():
    bpy.utils.unregister_class(LoadOperator)
    bpy.utils.unregister_class(LoadPartialOperator)
