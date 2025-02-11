from typing import Literal, cast

import bpy

from ...models import Editor
from ...states import state
from ...utils.algorithms import binary_search


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
                    > state.dancer_load_frames[1]
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
                    > state.dancer_load_frames[1]
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
