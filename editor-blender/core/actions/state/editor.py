import bpy

from ...models import EditMode, Editor
from ...states import state
from ...utils.ui import (
    outliner_hide_one_level,
    set_dopesheet_filter,
    set_outliner_hide_mesh,
    set_outliner_hide_mode_column,
    unset_outliner_focus_led,
    unset_outliner_hide_empty,
    unset_outliner_hide_mesh,
    unset_outliner_hide_mode_column,
)


def clear_selection():
    for obj in bpy.context.view_layer.objects.selected:  # type: ignore
        obj.select_set(False)  # type: ignore


def setup_control_editor():
    bpy.context.view_layer.objects.active = None  # type: ignore
    state.selected_obj_type = None
    clear_selection()

    unset_outliner_hide_empty()
    unset_outliner_hide_mesh()
    unset_outliner_focus_led()

    unset_outliner_hide_mode_column()

    outliner_hide_one_level()
    outliner_hide_one_level()

    set_dopesheet_filter("control")
    state.editor = Editor.CONTROL_EDITOR


def setup_pos_editor():
    bpy.context.view_layer.objects.active = None  # type: ignore
    state.selected_obj_type = None
    clear_selection()

    unset_outliner_hide_empty()
    set_outliner_hide_mesh()
    unset_outliner_focus_led()

    set_outliner_hide_mode_column()

    outliner_hide_one_level()
    outliner_hide_one_level()

    set_dopesheet_filter("pos")
    state.editor = Editor.POS_EDITOR


def setup_led_editor():
    bpy.context.view_layer.objects.active = None  # type: ignore
    state.selected_obj_type = None
    clear_selection()

    ld_ui_led_editor = getattr(bpy.context.window_manager, "ld_ui_led_editor")
    ld_ui_led_editor["edit_dancer"] = -1
    ld_ui_led_editor["edit_part"] = -1

    unset_outliner_hide_empty()
    set_outliner_hide_mesh()
    unset_outliner_focus_led()

    unset_outliner_hide_mode_column()

    outliner_hide_one_level()
    outliner_hide_one_level()

    set_dopesheet_filter("EMPTY")
    state.editor = Editor.LED_EDITOR


def set_editor(editor: Editor) -> bool:
    if state.edit_state == EditMode.EDITING:
        return False

    match editor:
        case Editor.CONTROL_EDITOR:
            if state.editor != Editor.CONTROL_EDITOR:
                setup_control_editor()

        case Editor.POS_EDITOR:
            if state.editor != Editor.POS_EDITOR:
                setup_pos_editor()

        case Editor.LED_EDITOR:
            if state.editor != Editor.LED_EDITOR:
                setup_led_editor()

    return True
