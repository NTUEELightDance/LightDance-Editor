from typing import Literal

import bpy

from ...models import Editor
from ...states import state


def increase_frame_index():
    if not bpy.context:
        return

    match state.editor:
        case Editor.CONTROL_EDITOR:
            sorted_ctrl_frames = sorted(
                [item[1].start for item in state.control_map.items()]
            )
            current_frame_index = state.current_control_index

            if current_frame_index < len(state.control_record) - 1:
                if (
                    sorted_ctrl_frames[current_frame_index + 1]
                    >= state.dancer_load_frames[1]
                ):
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index + 1),
                )
        case Editor.POS_EDITOR:
            sorted_pos_frames = sorted(
                [item[1].start for item in state.pos_map.items()]
            )
            current_frame_index = state.current_pos_index

            if current_frame_index < len(state.pos_record) - 1:
                if (
                    sorted_pos_frames[current_frame_index + 1]
                    >= state.dancer_load_frames[1]
                ):
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index + 1),
                )
        case Editor.LED_EDITOR:
            pass


def decrease_frame_index():
    if not bpy.context:
        return
    match state.editor:
        case Editor.CONTROL_EDITOR:
            sorted_ctrl_frames = sorted(
                [item[1].start for item in state.control_map.items()]
            )
            current_frame_index = state.current_control_index

            if current_frame_index > 0:
                if (
                    sorted_ctrl_frames[current_frame_index]
                    <= state.dancer_load_frames[0]
                ):
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index - 1),
                )
        case Editor.POS_EDITOR:
            sorted_pos_frames = sorted(
                [item[1].start for item in state.pos_map.items()]
            )
            current_frame_index = state.current_pos_index

            if current_frame_index > 0:
                if (
                    sorted_pos_frames[current_frame_index]
                    <= state.dancer_load_frames[0]
                ):
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index - 1),
                )
        case Editor.LED_EDITOR:
            pass
