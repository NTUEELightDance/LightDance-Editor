import bpy

from ...core.actions.state.shift import cancel_shift, confirm_shift, toggle_shift
from ...core.models import EditMode
from ...core.states import state
from ...properties.ui.types import TimeShiftStatusType
from ..async_core import AsyncOperator


class ToggleShifting(bpy.types.Operator):
    bl_idname = "lightdance.toggle_shifting"
    bl_label = "Toggle Time Shift"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return not state.edit_state == EditMode.EDITING

    def execute(self, context: bpy.types.Context):
        toggle_shift()
        return {"FINISHED"}


class CancelShifting(bpy.types.Operator):
    bl_idname = "lightdance.cancel_shifting"
    bl_label = "Cancel Time Shift"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.shifting

    def execute(self, context: bpy.types.Context):
        cancel_shift()
        return {"FINISHED"}


class ConfirmShifting(AsyncOperator):
    bl_idname = "lightdance.confirm_shifting"
    bl_label = "Confirm Time Shift"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        ld_ui_time_shift: TimeShiftStatusType = getattr(
            bpy.context.window_manager, "ld_ui_time_shift"
        )

        return (
            state.shifting
            and ld_ui_time_shift.displacement != 0
            and ld_ui_time_shift.start + ld_ui_time_shift.displacement >= 0
        )

    async def async_execute(self, context: bpy.types.Context):
        await confirm_shift()
        return {"FINISHED"}


def register():
    bpy.utils.register_class(ToggleShifting)
    bpy.utils.register_class(CancelShifting)
    bpy.utils.register_class(ConfirmShifting)


def unregister():
    bpy.utils.unregister_class(ToggleShifting)
    bpy.utils.unregister_class(CancelShifting)
    bpy.utils.unregister_class(ConfirmShifting)
