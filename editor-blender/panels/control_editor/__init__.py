import bpy

from ...core.models import EditMode, Editor
from ...core.states import state
from ...properties.types import LightType, ObjectType


class PosEditor(bpy.types.Panel):
    bl_label = "Control"
    bl_idname = "VIEW_PT_LightDance_ControlEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        obj = context.object
        ld_object_type: str = getattr(obj, "ld_object_type")

        return (
            state.ready
            and state.editor == Editor.CONTROL_EDITOR
            and ld_object_type == ObjectType.LIGHT.value
        )

    def draw(self, context: bpy.types.Context):
        editing = state.edit_state == EditMode.EDITING
        properties_enabled = editing and not state.is_playing

        # position: PositionPropertyType = getattr(context.object, "ld_position")

        layout = self.layout

        if state.current_editing_detached and editing:
            row = layout.row()
            row.enabled = not state.is_playing
            row.label(text="Detached", icon="ERROR")
            row.operator("lightdance.attach_editing_control_frame", icon="PLAY")

        column = layout.column()
        column.enabled = properties_enabled

        ld_light_type: str = getattr(context.object, "ld_light_type")
        # TODO: Support new bulbs mode
        if ld_light_type == LightType.FIBER.value:
            column.prop(context.object, "ld_color", text="Color")
            column.prop(context.object, "ld_alpha", text="Alpha", slider=True)
        elif ld_light_type == LightType.LED.value:
            column.prop(context.object, "ld_effect", text="Effect")
            column.prop(context.object, "ld_alpha", text="Alpha", slider=True)


def register():
    bpy.utils.register_class(PosEditor)


def unregister():
    bpy.utils.unregister_class(PosEditor)
