import bpy

from ...core.models import EditMode, Editor
from ...core.states import state
from ...properties.types import ObjectType, PositionPropertyType
from ...properties.ui.types import PosEditorStatusType


class TimeShift(bpy.types.Panel):
    bl_label = "Time Shift"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_TimeShift"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready and state.shifting

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.enabled = not state.requesting

        layout.label(text="Time Shift")

        row = layout.row()
        row.operator("lightdance.confirm_shifting", icon="CHECKMARK")
        row.operator("lightdance.cancel_shifting", icon="X")


def register():
    bpy.utils.register_class(TimeShift)


def unregister():
    bpy.utils.unregister_class(TimeShift)
