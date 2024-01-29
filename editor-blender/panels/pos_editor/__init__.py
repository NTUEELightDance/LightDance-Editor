import bpy

from ...core.models import EditMode, Editor
from ...core.states import state
from ...properties.types import ObjectType, PositionPropertyType
from ...properties.ui.types import PosEditorStatusType


class PosEditor(bpy.types.Panel):
    bl_label = "Position"
    bl_idname = "VIEW_PT_LightDance_PosEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready and state.editor == Editor.POS_EDITOR

    def draw(self, context: bpy.types.Context):
        editing = state.edit_state == EditMode.EDITING
        properties_enabled = editing and not state.is_playing

        layout = self.layout

        if state.current_editing_detached and editing:
            row = layout.row()
            row.enabled = not state.is_playing
            row.label(text="Detached", icon="ERROR")
            row.operator("lightdance.attach_editing_pos_frame", icon="PLAY")

        # check if object is selected
        obj = context.object
        if obj is None:  # type: ignore
            return

        ld_object_type: str = getattr(obj, "ld_object_type")
        if ld_object_type != ObjectType.DANCER.value or not obj.select_get():
            return

        column = layout.column()
        column.enabled = properties_enabled

        ld_ui_pos_editor: PosEditorStatusType = getattr(
            context.window_manager, "ld_ui_pos_editor"
        )

        if ld_ui_pos_editor.multi_select:
            column.prop(
                ld_ui_pos_editor, "multi_select_delta_transform", text="Delta Transform"
            )

        else:
            position: PositionPropertyType = getattr(context.object, "ld_position")
            column.prop(position, "transform", text="Transform")
            column.prop(position, "rotation", text="Rotation")


def register():
    bpy.utils.register_class(PosEditor)


def unregister():
    bpy.utils.unregister_class(PosEditor)
