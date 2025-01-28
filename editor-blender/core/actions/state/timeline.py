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
    if not bpy.context:
        return
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


def increase_beat_index():
    if not bpy.context:
        return
    data = state.music_beats
    current_time = cast(int, bpy.context.scene.frame_current)
    index = binary_search(arr=data, x=current_time)
    if index < len(data) - 1:
        index += 1
    bpy.context.scene.frame_current = data[index]


def decrease_beat_index():
    if not bpy.context:
        return
    data = state.music_beats
    current_time = cast(int, bpy.context.scene.frame_current)
    index = binary_search(arr=data, x=current_time)
    if index > 0:
        index -= 1
    bpy.context.scene.frame_current = data[index]
