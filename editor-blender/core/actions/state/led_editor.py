from typing import Optional

import bpy

from ....core.models import EditMode
from ....core.states import state
from ....core.utils.operator import execute_operator
from ....core.utils.ui import (
    set_outliner_filter,
    set_outliner_hide_empty,
    set_outliner_hide_mesh,
    set_outliner_hide_mode_column,
    unset_outliner_hide_empty,
    unset_outliner_hide_mesh,
    unset_outliner_hide_mode_column,
)
from ....properties.ui.types import LEDEditorEditModeType, LEDEditorStatusType


async def request_edit_led_effect():
    # TODO: Send request
    enter_editing_led_effect()


async def cancel_edit_led_effect():
    # TODO: Send request
    exit_editing_led_effect()


async def save_led_effect():
    pass


async def delete_led_effect():
    pass


def enter_editing_led_effect():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )
    ld_ui_led_editor.edit_mode = LEDEditorEditModeType.EDIT.value

    edit_dancer = ld_ui_led_editor.edit_dancer
    edit_part = ld_ui_led_editor.edit_part
    edit_effect = ld_ui_led_editor.edit_effect

    dancer_index = state.dancer_names.index(edit_dancer)
    part_obj_name = f"{dancer_index}_" + edit_part
    part_obj: bpy.types.Object = bpy.data.objects.get(part_obj_name)  # type: ignore

    dancer_obj: bpy.types.Object = bpy.data.objects.get(edit_dancer)  # type: ignore

    # Set edit state
    state.edit_state = EditMode.EDITING

    # Set effect state to bulbs
    setattr(part_obj, "ld_effect", edit_effect)
    setattr(part_obj, "ld_alpha", 255)

    # Place dancer in center of view
    dancer_obj.location = (0, 0, 0)

    # Mute fcurves of dancer and LED bulbs
    for i in range(3):
        dancer_obj.animation_data.action.fcurves.find("location", index=i).mute = True

    for bulb_obj in part_obj.children:
        for i in range(4):
            bulb_obj.animation_data.action.fcurves.find("color", index=i).mute = True

    # Only select human and bulbs for local view
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)

    # Select LED bulbs
    for obj in part_obj.children:
        obj.select_set(True)

    # Toggle local view
    execute_operator("view3d.localview")

    # De-select all objects
    bpy.context.view_layer.objects.active = None  # type: ignore
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)

    # Setup outliner filter
    set_outliner_filter(part_obj_name + ".")
    unset_outliner_hide_mesh()
    set_outliner_hide_empty()
    set_outliner_hide_mode_column()


def exit_editing_led_effect():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )

    edit_dancer = ld_ui_led_editor.edit_dancer
    edit_part = ld_ui_led_editor.edit_part

    dancer_index = state.dancer_names.index(edit_dancer)
    part_obj_name = f"{dancer_index}_" + edit_part
    part_obj: bpy.types.Object = bpy.data.objects.get(part_obj_name)  # type: ignore

    dancer_obj: bpy.types.Object = bpy.data.objects.get(edit_dancer)  # type: ignore

    # Mute fcurves of dancer and LED bulbs
    for i in range(3):
        dancer_obj.animation_data.action.fcurves.find("location", index=i).mute = False

    for bulb_obj in part_obj.children:
        for i in range(4):
            bulb_obj.animation_data.action.fcurves.find("color", index=i).mute = False

    # Reset pos and color of dancer and LED bulbs
    bpy.context.scene.frame_current = bpy.context.scene.frame_current

    # Exit local view
    execute_operator("view3d.localview")

    # De-select all objects
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)

    # Re-select LED
    bpy.context.view_layer.objects.active = part_obj
    part_obj.select_set(True)

    for obj in part_obj.children:
        obj.select_set(True)

    # Set edit state
    state.edit_state = EditMode.IDLE
    ld_ui_led_editor.edit_mode = LEDEditorEditModeType.IDLE.value

    # Reset outliner filter
    set_outliner_filter("")
    set_outliner_hide_mesh()
    unset_outliner_hide_empty()
    unset_outliner_hide_mode_column()
