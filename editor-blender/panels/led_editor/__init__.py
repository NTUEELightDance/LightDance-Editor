import bpy

from ...core.models import Editor
from ...core.states import state
from ...properties.types import LightType, ObjectType
from ...properties.ui.types import LEDEditorEditModeType, LEDEditorStatusType


class LEDEditor(bpy.types.Panel):
    bl_label = "LED Effect"
    bl_parent_id = "VIEW_PT_LightDance_LightDance"
    bl_idname = "VIEW_PT_LightDance_LEDEditor"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "LightDance"
    bl_options = {"HIDE_HEADER"}

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready and state.sync and state.editor == Editor.LED_EDITOR

    def draw(self, context: bpy.types.Context):
        layout = self.layout
        layout.enabled = not state.shifting and not state.requesting

        row = layout.row()
        row.label(text="LED Effect")

        ld_ui_led_editor: LEDEditorStatusType = getattr(
            context.window_manager, "ld_ui_led_editor"
        )

        edit_mode = ld_ui_led_editor.edit_mode

        if edit_mode == LEDEditorEditModeType.IDLE.value:
            row = layout.row()
            row.prop(ld_ui_led_editor, "edit_model", text="Model")

            row = layout.row()
            row.prop(ld_ui_led_editor, "edit_dancer", text="Dancer")

            row = layout.row()
            row.prop(ld_ui_led_editor, "edit_part", text="Part")

            row = layout.row()
            row.prop(ld_ui_led_editor, "edit_effect", text="Effect")

        elif edit_mode == LEDEditorEditModeType.EDIT.value:
            # TODO: Show part info

            # show properties of light
            column = layout.column()

            if ld_ui_led_editor.multi_select:
                column.prop(ld_ui_led_editor, "multi_select_color", text="Color")
            else:
                # check if object is selected
                obj = context.object
                if obj is None:  # type: ignore
                    return

                ld_object_type: str = getattr(obj, "ld_object_type")
                ld_light_type: str = getattr(obj, "ld_light_type")
                if (
                    ld_object_type != ObjectType.LIGHT.value
                    or ld_light_type != LightType.LED_BULB.value
                ):
                    return

                column.prop(obj, "ld_color", text="Color")

        else:
            column = layout.column()
            column.prop(ld_ui_led_editor, "new_effect", text="Name")


def register():
    bpy.utils.register_class(LEDEditor)


def unregister():
    bpy.utils.unregister_class(LEDEditor)
