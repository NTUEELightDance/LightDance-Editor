import bpy

from ...models import Editor
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
                pass
            case Editor.POS_EDITOR:
                if num >= 0 and num < len(state.pos_record):
                    current_frame_index = num
                    current_frame_id = state.pos_record[current_frame_index]
                    current_frame = state.pos_map[current_frame_id]
                    start = current_frame.start

                    bpy.context.scene.frame_set(start)
            case Editor.LED_EDITOR:
                pass
