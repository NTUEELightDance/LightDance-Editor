import bpy

from ...models import EditMode, Editor
from ...states import state
from ...utils.object import clear_selection
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


def setup_control_editor():
    if not bpy.context:
        return
    bpy.context.view_layer.objects.active = None
    state.selected_obj_type = None
    clear_selection()

    ld_ui_control_editor = getattr(bpy.context.window_manager, "ld_ui_control_editor")
    ld_ui_control_editor["show_fiber"] = False
    ld_ui_control_editor["show_led"] = False
    ld_ui_control_editor["show_all"] = True

    unset_outliner_hide_empty()
    unset_outliner_hide_mesh()
    unset_outliner_focus_led()

    unset_outliner_hide_mode_column()

    outliner_hide_one_level()
    outliner_hide_one_level()

    set_dopesheet_filter("control_frame")
    state.editor = Editor.CONTROL_EDITOR


def setup_pos_editor():
    if not bpy.context:
        return
    bpy.context.view_layer.objects.active = None
    state.selected_obj_type = None
    clear_selection()

    unset_outliner_hide_empty()
    set_outliner_hide_mesh()
    unset_outliner_focus_led()

    set_outliner_hide_mode_column()

    outliner_hide_one_level()
    outliner_hide_one_level()

    set_dopesheet_filter("pos_frame")
    state.editor = Editor.POS_EDITOR


def setup_led_editor():
    if not bpy.context:
        return
    bpy.context.view_layer.objects.active = None
    state.selected_obj_type = None
    clear_selection()

    ld_ui_led_editor = getattr(bpy.context.window_manager, "ld_ui_led_editor")
    ld_ui_led_editor["edit_model"] = -1
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
