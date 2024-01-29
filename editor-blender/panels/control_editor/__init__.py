import bpy

from ...core.models import EditMode, Editor, SelectedPartType
from ...core.states import state
from ...properties.types import LightType, ObjectType
from ...properties.ui.types import ControlEditorStatusType


class ControlEditor(bpy.types.Panel):
    bl_label = "Control"
    bl_idname = "VIEW_PT_LightDance_ControlEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready and state.editor == Editor.CONTROL_EDITOR

    def draw(self, context: bpy.types.Context):
        editing = state.edit_state == EditMode.EDITING
        properties_enabled = editing and not state.is_playing

        layout = self.layout

        if state.current_editing_detached and editing:
            row = layout.row()
            row.enabled = not state.is_playing
            row.label(text="Detached", icon="ERROR")
            row.operator("lightdance.attach_editing_control_frame", icon="PLAY")

        # show properties of light
        column = layout.column()
        column.enabled = properties_enabled

        ld_ui_control_editor: ControlEditorStatusType = getattr(
            context.window_manager, "ld_ui_control_editor"
        )

        if ld_ui_control_editor.multi_select:
            if state.selected_obj_type == SelectedPartType.FIBER:
                column.prop(ld_ui_control_editor, "multi_select_color", text="Color")
                column.prop(
                    ld_ui_control_editor,
                    "multi_select_alpha",
                    text="Alpha",
                    slider=True,
                )
            else:
                column.prop(
                    ld_ui_control_editor,
                    "multi_select_alpha",
                    text="Alpha",
                    slider=True,
                )

        else:
            obj = context.object
            if obj is None or getattr(obj, "ld_object_type") != ObjectType.LIGHT.value:  # type: ignore
                return

            ld_light_type: str = getattr(context.object, "ld_light_type")
            if ld_light_type == LightType.FIBER.value:
                column.prop(context.object, "ld_color", text="Color")
                column.prop(context.object, "ld_alpha", text="Alpha", slider=True)
            elif ld_light_type == LightType.LED.value:
                column.prop(context.object, "ld_effect", text="Effect")
                column.prop(context.object, "ld_alpha", text="Alpha", slider=True)


def register():
    bpy.utils.register_class(ControlEditor)


def unregister():
    bpy.utils.unregister_class(ControlEditor)
