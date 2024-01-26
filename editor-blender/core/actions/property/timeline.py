import bpy

from ...models import EditMode, Editor
from ...states import state


def get_current_frame_index(self: bpy.types.WindowManager) -> str:
    # return self.get("ld_current_frame_index", "0")  # type: ignore
    match state.editor:
        case Editor.CONTROL_EDITOR:
            return str(state.current_control_index)
        case Editor.POS_EDITOR:
            return str(state.current_pos_index)
        case Editor.LED_EDITOR:
            return "0"


def set_current_frame_index(self: bpy.types.WindowManager, value: str):
    if str.isnumeric(value):
        num = int(value)
        match state.editor:
            case Editor.CONTROL_EDITOR:
                if num >= 0 and num < len(state.control_record):
                    current_frame_index = num
                    current_frame_id = state.control_record[current_frame_index]
                    current_frame = state.control_map[current_frame_id]
                    start = current_frame.start

                    bpy.context.scene.frame_set(start)
            case Editor.POS_EDITOR:
                if num >= 0 and num < len(state.pos_record):
                    current_frame_index = num
                    current_frame_id = state.pos_record[current_frame_index]
                    current_frame = state.pos_map[current_frame_id]
                    start = current_frame.start

                    bpy.context.scene.frame_set(start)
            case Editor.LED_EDITOR:
                pass


def get_fade(self: bpy.types.WindowManager) -> bool:
    # return self.get("ld_current_frame_index", "0")  # type: ignore
    match state.editor:
        case Editor.CONTROL_EDITOR:
            id = state.control_record[state.current_control_index]
            return state.control_map[id].fade
        case Editor.POS_EDITOR:
            return False
        case Editor.LED_EDITOR:
            return False


def set_fade(self: bpy.types.WindowManager, value: bool):
    if state.edit_state == EditMode.EDITING:
        match state.editor:
            case Editor.CONTROL_EDITOR:
                id = state.control_record[state.current_control_index]
                state.control_map[id].fade = value
            case Editor.POS_EDITOR:
                pass
            case Editor.LED_EDITOR:
                pass
