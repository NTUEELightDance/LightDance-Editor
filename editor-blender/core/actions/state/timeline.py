from typing import cast

import bpy

from ...models import Editor
from ...states import state
from ...utils.algorithms import binary_search


def increase_frame_index():
    if not bpy.context:
        return

    match state.editor:
        case Editor.CONTROL_EDITOR:
            sorted_ctrl_start = state.control_start_record
            current_frame_index = state.current_control_index

            if current_frame_index >= len(sorted_ctrl_start) - 1:
                return

            next_index = current_frame_index + 1
            next_start = (
                sorted_ctrl_start[next_index]
                if next_index < len(sorted_ctrl_start)
                else None
            )

            if next_start is None or next_start > state.dancer_load_frames[1]:
                return

            setattr(
                bpy.context.window_manager,
                "ld_current_frame_index",
                str(next_index),
            )
        case Editor.POS_EDITOR:
            sorted_pos_frames = state.pos_start_record
            current_frame_index = state.current_pos_index
            if current_frame_index < len(state.pos_record) - 1:
                next_index = current_frame_index + 1
                next_start = (
                    sorted_pos_frames[next_index]
                    if next_index < len(sorted_pos_frames)
                    else None
                )

                if next_start is not None and next_start > state.dancer_load_frames[1]:
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(next_index),
                )
        case Editor.LED_EDITOR:
            pass


def decrease_frame_index():
    if not bpy.context:
        return
    match state.editor:
        case Editor.CONTROL_EDITOR:
            sorted_ctrl_start = state.control_start_record
            current_frame_index = state.current_control_index

            if current_frame_index <= 0:
                return

            prev_frame_index = current_frame_index - 1
            prev_start = (
                sorted_ctrl_start[prev_frame_index] if prev_frame_index >= 0 else None
            )
            if prev_start is None or prev_start < state.dancer_load_frames[0]:
                return
            setattr(
                bpy.context.window_manager,
                "ld_current_frame_index",
                str(prev_frame_index),
            )
        case Editor.POS_EDITOR:
            sorted_pos_frames = state.pos_start_record
            current_frame_index = state.current_pos_index
            if current_frame_index > 0:
                current_start = (
                    sorted_pos_frames[current_frame_index]
                    if current_frame_index < len(sorted_pos_frames)
                    else None
                )

                if (
                    current_start is not None
                    and current_start <= state.dancer_load_frames[0]
                ):
                    return
                setattr(
                    bpy.context.window_manager,
                    "ld_current_frame_index",
                    str(current_frame_index - 1),
                )
        case Editor.LED_EDITOR:
            pass


def increase_beat_index():
    if not bpy.context:
        return
    data = state.music_beats
    current_time = cast(int, bpy.context.scene.frame_current)
    index = binary_search(arr=data, x=current_time) + 1
    index = index % len(data)
    # index = min(len(data) - 1, index)
    bpy.context.scene.frame_current = data[index]


def decrease_beat_index():
    if not bpy.context:
        return
    data = state.music_beats
    current_time = cast(int, bpy.context.scene.frame_current)
    index = binary_search(arr=data, x=current_time)
    if index >= 0 and data[index] == current_time:
        index -= 1
    index = (index + len(data)) % len(data)
    bpy.context.scene.frame_current = data[index]
