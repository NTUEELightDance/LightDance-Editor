from ...models import EditMode, Editor
from ...states import state
from ...utils.ui import set_dopesheet_filter


# TODO: Modify other related states
def set_editor(editor: Editor) -> bool:
    if state.edit_state == EditMode.EDITING:
        return False

    match editor:
        case Editor.CONTROL_EDITOR:
            if state.editor != Editor.CONTROL_EDITOR:
                set_dopesheet_filter("control")
                state.editor = Editor.CONTROL_EDITOR
            return True
        case Editor.POS_EDITOR:
            if state.editor != Editor.POS_EDITOR:
                set_dopesheet_filter("pos")
                state.editor = Editor.POS_EDITOR
            return True
        case Editor.LED_EDITOR:
            if state.editor != Editor.LED_EDITOR:
                set_dopesheet_filter("EMPTY")
                state.editor = Editor.LED_EDITOR
            return True
