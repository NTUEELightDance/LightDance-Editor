import bpy

from ...models import EditMode, Editor
from ...states import state
from ...utils.ui import (
    outliner_hide_one_level,
    set_dopesheet_filter,
    set_outliner_hide_mesh,
    set_outliner_hide_mode_column,
    unset_outliner_hide_mesh,
    unset_outliner_hide_mode_column,
)


def clear_selection():
    for obj in bpy.context.selected_objects:
        obj.select_set(False)


def set_editor(editor: Editor) -> bool:
    if state.edit_state == EditMode.EDITING:
        return False

    if state.editor == Editor.LED_EDITOR and editor != Editor.LED_EDITOR:
        # leave led editor
        unset_outliner_hide_mesh()
    if state.editor == Editor.POS_EDITOR and editor != Editor.POS_EDITOR:
        # leave pos editor
        unset_outliner_hide_mesh()
        unset_outliner_hide_mode_column()

    match editor:
        case Editor.CONTROL_EDITOR:
            if state.editor != Editor.CONTROL_EDITOR:
                clear_selection()
                set_dopesheet_filter("control")
                state.editor = Editor.CONTROL_EDITOR

            return True

        case Editor.POS_EDITOR:
            if state.editor != Editor.POS_EDITOR:
                set_outliner_hide_mesh()
                set_outliner_hide_mode_column()
                outliner_hide_one_level()

                clear_selection()
                set_dopesheet_filter("pos")
                state.editor = Editor.POS_EDITOR

            return True

        case Editor.LED_EDITOR:
            if state.editor != Editor.LED_EDITOR:
                # Clear previous selection
                ld_ui_led_editor = getattr(
                    bpy.context.window_manager, "ld_ui_led_editor"
                )
                ld_ui_led_editor["edit_dancer"] = -1
                ld_ui_led_editor["edit_part"] = -1

                set_outliner_hide_mesh()

                clear_selection()
                set_dopesheet_filter("EMPTY")
                state.editor = Editor.LED_EDITOR

            return True
