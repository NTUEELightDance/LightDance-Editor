import bpy

from ...models import Editor
from ...states import state


def increase_frame_index():
    match state.editor:
        case Editor.CONTROL_EDITOR:
            current_frame_index = state.current_control_index
            if current_frame_index < len(state.control_record) - 1:
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index + 1),
                )
        case Editor.POS_EDITOR:
            current_frame_index = state.current_pos_index
            if current_frame_index < len(state.pos_record) - 1:
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index + 1),
                )
        case Editor.LED_EDITOR:
            pass


def decrease_frame_index():
    match state.editor:
        case Editor.CONTROL_EDITOR:
            current_frame_index = state.current_control_index
            if current_frame_index > 0:
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index - 1),
                )
        case Editor.POS_EDITOR:
            current_frame_index = state.current_pos_index
            if current_frame_index > 0:
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index - 1),
                )
        case Editor.LED_EDITOR:
            pass
