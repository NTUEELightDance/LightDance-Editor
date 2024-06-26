import traceback
from typing import List, Tuple

import bpy

from ....api.led_agent import led_agent
from ....core.models import ColorID, EditMode, LEDEffect
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
from ...utils.notification import notify
from .app_state import set_requesting


async def add_led_effect():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )
    state.edit_state = EditMode.EDITING
    ld_ui_led_editor.edit_mode = LEDEditorEditModeType.NEW.value
    ld_ui_led_editor.new_effect = "New effect"


async def request_edit_led_effect():
    led_index = state.current_led_index
    set_requesting(True)
    ok = await led_agent.request_edit(led_index)
    set_requesting(False)
    if ok is not None and ok:
        enter_editing_led_effect()
    else:
        notify("WARNING", "Edit request rejected")


async def cancel_edit_led_effect():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )
    led_index = state.current_led_index
    edit_mode = ld_ui_led_editor.edit_mode
    match edit_mode:
        case LEDEditorEditModeType.EDIT.value:
            set_requesting(True)
            ok = await led_agent.cancel_edit(led_index)
            set_requesting(False)
            if ok is not None and ok:
                exit_editing_led_effect()
                notify("INFO", "Edit cancelled")
            else:
                notify("WARNING", "Cannot cancel edit")

        case LEDEditorEditModeType.NEW.value:
            state.edit_state = EditMode.IDLE
            ld_ui_led_editor.edit_mode = LEDEditorEditModeType.IDLE.value

        case _:
            pass


async def save_led_effect():
    ld_ui_led_editor: LEDEditorStatusType = getattr(
        bpy.context.window_manager, "ld_ui_led_editor"
    )
    edit_mode = ld_ui_led_editor.edit_mode
    match edit_mode:
        case LEDEditorEditModeType.EDIT.value:
            led_index = state.current_led_index
            led_effect = state.led_effect_id_table[led_index]
            effect_name = led_effect.name
            edit_dancer = ld_ui_led_editor.edit_dancer
            edit_part = ld_ui_led_editor.edit_part
            dancer_index = state.dancer_names.index(edit_dancer)
            part_obj_name = f"{dancer_index}_" + edit_part
            part_obj: bpy.types.Object = bpy.data.objects.get(part_obj_name)  # type: ignore
            part_child_objs = part_obj.children
            new_effect: List[Tuple[ColorID, int]] = [(-1, 0)] * len(part_child_objs)
            for i, obj in enumerate(part_child_objs):
                if obj:
                    ld_color: ColorID = obj.get("ld_color")  # type: ignore # must use get
                    ld_alpha: int = getattr(obj, "ld_alpha")  # type: ignore # must use getattr
                    new_effect[i] = (ld_color, ld_alpha)
                else:
                    raise Exception(f"LED bulb object missing in {part_obj_name}")
            try:
                set_requesting(True)
                await led_agent.save_led_effect(led_index, effect_name, new_effect)
                notify("INFO", "Saved LED Effect")

                # Imediately apply changes produced by editing
                # set_ctrl_keyframes_from_state(effect_only=True)

                # Cancel editing
                ok = await led_agent.cancel_edit(led_index)
                set_requesting(False)
                if ok is not None and ok:
                    exit_editing_led_effect()
                else:
                    notify("WARNING", "Cannot exit editing")
            except Exception:
                traceback.print_exc()
                notify("WARNING", "Cannot save LED effect")

        case LEDEditorEditModeType.NEW.value:
            new_effect_name = ld_ui_led_editor.new_effect
            edit_model = ld_ui_led_editor.edit_model
            edit_dancer = ld_ui_led_editor.edit_dancer
            edit_part = ld_ui_led_editor.edit_part
            part_effect: LEDEffect = next(
                effect for _, effect in state.led_map[edit_model][edit_part].items()
            )
            led_default = [
                (bulb_data.color_id, bulb_data.alpha)
                for bulb_data in part_effect.effect
            ]

            try:
                set_requesting(True)
                res = await led_agent.add_led_effect(
                    new_effect_name, edit_model, edit_part, led_default
                )
                set_requesting(False)
                if res and res.ok:
                    notify("INFO", f"Added LED Effect: {new_effect_name}")
                    state.edit_state = EditMode.IDLE
                    setattr(
                        ld_ui_led_editor, "edit_mode", LEDEditorEditModeType.IDLE.value
                    )
                else:
                    notify("WARNING", "Cannot add LED effect")
            except Exception:
                traceback.print_exc()
                notify("WARNING", "Cannot add LED effect")

        case _:
            pass


async def delete_led_effect():
    led_index = state.current_led_index
    if led_index == -1:
        notify("WARNING", "No LED effect is selected!")
        return
    try:
        set_requesting(True)
        res = await led_agent.delete_led_effect(led_index)
        set_requesting(False)
        if res and res.ok:
            notify("INFO", f"Deleted LED effect: {led_index}")
        else:
            notify("WARNING", "Cannot delete LED effect")
    except Exception:
        traceback.print_exc()
        notify("WARNING", "Cannot delete LED effect")


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
        for i in range(3):
            bulb_obj.animation_data.action.fcurves.find("color", index=i).mute = True

    # Only select human and bulbs for local view
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)

    # Select LED bulbs
    for obj in part_obj.children:
        obj.select_set(True)

    # Toggle local view
    execute_operator("view3d.localview")
    state.local_view = True

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
        for i in range(3):
            bulb_obj.animation_data.action.fcurves.find("color", index=i).mute = False

    # Reset pos and color of dancer and LED bulbs
    bpy.context.scene.frame_current = bpy.context.scene.frame_current

    # Exit local view
    execute_operator("view3d.localview")
    state.local_view = False

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
