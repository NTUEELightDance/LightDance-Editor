import bpy

from ...actions.state.current_pos import update_current_pos_by_index
from ...actions.state.current_status import update_current_status_by_index
from ...models import EditMode, Editor
from ...states import state
from ...utils.convert import time_to_frame


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
    if not bpy.context:
        return
    if str.isnumeric(value):
        num = int(value)
        match state.editor:
            case Editor.CONTROL_EDITOR:
                if num >= 0 and num < len(state.control_record):
                    current_frame_index = num
                    current_frame_id = state.control_record[current_frame_index]
                    current_frame = state.control_map[current_frame_id]
                    start = current_frame.start

                    if (
                        start < state.dancer_load_frames[0]
                        or start > state.dancer_load_frames[1]
                    ):
                        return

                    bpy.context.scene.frame_current = start
                    state.current_control_index = current_frame_index

                    if not state.edit_state == EditMode.EDITING:
                        update_current_status_by_index()

            case Editor.POS_EDITOR:
                if num >= 0 and num < len(state.pos_record):
                    current_frame_index = num
                    current_frame_id = state.pos_record[current_frame_index]
                    current_frame = state.pos_map_MODIFIED.get(
                        current_frame_id
                    ) or state.pos_map.get(current_frame_id)

                    if current_frame is not None:
                        start = current_frame.start
                    elif state.pos_start_record and len(state.pos_start_record) == len(
                        state.pos_record
                    ):
                        start = state.pos_start_record[current_frame_index]
                    else:
                        return

                    if (
                        start < state.dancer_load_frames[0]
                        or start > state.dancer_load_frames[1]
                    ):
                        return

                    bpy.context.scene.frame_current = start
                    state.current_pos_index = current_frame_index

                    if not state.edit_state == EditMode.EDITING:
                        update_current_pos_by_index()

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


def get_play_speed(self: bpy.types.WindowManager) -> float:
    return self["ld_play_speed"]  # type: ignore


def set_play_speed(self: bpy.types.WindowManager, value: float):
    if not bpy.context:
        return
    if bpy.context.screen.is_animation_playing:
        return

    self["ld_play_speed"] = value

    current_frame = bpy.context.scene.frame_current
    bpy.context.scene.render.fps_base = 1 / value

    bpy.context.scene.frame_current = current_frame


def get_time(self: bpy.types.WindowManager) -> str:
    return self["ld_time"]  # type: ignore


def set_time(self: bpy.types.WindowManager, value: str):
    if not bpy.context:
        return
    frame = time_to_frame(value)
    if frame < state.dancer_load_frames[0] or frame > state.dancer_load_frames[1]:
        return

    self["ld_time"] = value
    bpy.context.scene.frame_current = frame
