from typing import Optional

import bpy

from ...core.states import state
from ...core.utils.operator import execute_operator
from ...core.utils.ui import (
    set_outliner_filter,
    set_outliner_hide_empty,
    set_outliner_hide_mesh,
    set_outliner_hide_mode_column,
    unset_outliner_hide_empty,
    unset_outliner_hide_mesh,
    unset_outliner_hide_mode_column,
)
from ...properties.ui.types import LEDEditorEditModeType, LEDEditorStatusType


class LEDEditorEditModeOperator(bpy.types.Operator):
    bl_idname = "lightdance.led_editor_edit_mode"
    bl_label = "LED Editor Edit Mode"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def execute(self, context: bpy.types.Context):
        # TODO: Set states

        ld_ui_led_editor: LEDEditorStatusType = getattr(
            context.window_manager, "ld_ui_led_editor"
        )
        ld_ui_led_editor.edit_mode = LEDEditorEditModeType.EDIT.value

        edit_dancer = ld_ui_led_editor.edit_dancer
        edit_part = ld_ui_led_editor.edit_part

        dancer_index = state.dancer_names.index(edit_dancer)
        part_obj_name = f"{dancer_index}_" + edit_part
        part_obj: Optional[bpy.types.Object] = bpy.data.objects.get(part_obj_name)

        if part_obj is not None:
            # Only select human and bulbs for local view
            bpy.context.view_layer.objects.active = None  # type: ignore
            for obj in bpy.context.selected_objects:
                obj.select_set(False)

            # Select LED bulbs
            for obj in part_obj.children:  # type: ignore
                obj.select_set(True)

            # Toggle local view
            execute_operator("view3d.localview")

            # De-select all objects
            for obj in bpy.context.selected_objects:
                obj.select_set(False)

            # Setup outliner filter
            set_outliner_filter(part_obj_name + ".")
            unset_outliner_hide_mesh()
            set_outliner_hide_empty()
            set_outliner_hide_mode_column()

        return {"FINISHED"}


class LEDEditorCancelEditModeOperator(bpy.types.Operator):
    bl_idname = "lightdance.led_editor_cancel_edit_mode"
    bl_label = "LED Editor Cancel Edit Mode"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def execute(self, context: bpy.types.Context):
        # TODO: Set states

        ld_ui_led_editor: LEDEditorStatusType = getattr(
            context.window_manager, "ld_ui_led_editor"
        )
        ld_ui_led_editor.edit_mode = LEDEditorEditModeType.IDLE.value

        # De-select all objects
        for obj in bpy.context.selected_objects:
            obj.select_set(False)

        # Exit local view
        execute_operator("view3d.localview")

        # Reset outliner filter
        set_outliner_filter("")
        set_outliner_hide_mesh()
        unset_outliner_hide_empty()
        unset_outliner_hide_mode_column()

        return {"FINISHED"}


def register():
    # bpy.utils.register_class(LEDEditorEditModeOperator)
    # bpy.utils.register_class(LEDEditorCancelEditModeOperator)
    pass


def unregister():
    # bpy.utils.unregister_class(LEDEditorEditModeOperator)
    # bpy.utils.unregister_class(LEDEditorCancelEditModeOperator)
    pass
