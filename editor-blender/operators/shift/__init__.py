import bpy

from ...core.actions.state.shift import cancel_shift, confirm_shift, toggle_shift
from ...core.models import EditMode
from ...core.states import state
from ...core.utils.notification import notify
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
    bl_options = {"REGISTER", "UNDO"}

    confirm: bpy.props.BoolProperty(  # type: ignore
        name="I know what I am doing",
        default=False,
    )

    @classmethod
    def poll(cls, context: bpy.types.Context):
        ld_ui_time_shift: TimeShiftStatusType = getattr(
            bpy.context.window_manager, "ld_ui_time_shift"
        )

        return (
            state.shifting
            and ld_ui_time_shift.displacement != 0
            and ld_ui_time_shift.start != ld_ui_time_shift.end
            and ld_ui_time_shift.start + ld_ui_time_shift.displacement >= 0
        )

    async def async_execute(self, context: bpy.types.Context):
        confirm: bool = getattr(self, "confirm")
        if confirm:
            setattr(self, "confirm", False)
            await confirm_shift()
        else:
            notify("ERROR", "Time shift cancelled")

        return {"FINISHED"}

    def invoke(self, context: bpy.types.Context, event: bpy.types.Event):
        return context.window_manager.invoke_props_dialog(self)


def register():
    bpy.utils.register_class(ToggleShifting)
    bpy.utils.register_class(CancelShifting)
    bpy.utils.register_class(ConfirmShifting)


def unregister():
    bpy.utils.unregister_class(ToggleShifting)
    bpy.utils.unregister_class(CancelShifting)
    bpy.utils.unregister_class(ConfirmShifting)
