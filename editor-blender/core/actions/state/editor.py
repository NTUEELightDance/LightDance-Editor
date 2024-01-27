import bpy

from ...models import EditMode, Editor
from ...states import state
from ...utils.ui import set_dopesheet_filter


def clear_selection():
    for obj in bpy.context.selected_objects:
        obj.select_set(False)


def set_editor(editor: Editor) -> bool:
    if state.edit_state == EditMode.EDITING:
        return False

    match editor:
        case Editor.CONTROL_EDITOR:
            if state.editor != Editor.CONTROL_EDITOR:
                clear_selection()
                set_dopesheet_filter("control")
                state.editor = Editor.CONTROL_EDITOR
            return True
        case Editor.POS_EDITOR:
            if state.editor != Editor.POS_EDITOR:
                clear_selection()
                set_dopesheet_filter("pos")
                state.editor = Editor.POS_EDITOR
            return True
        case Editor.LED_EDITOR:
            if state.editor != Editor.LED_EDITOR:
                clear_selection()
                set_dopesheet_filter("EMPTY")
                state.editor = Editor.LED_EDITOR
            return True
