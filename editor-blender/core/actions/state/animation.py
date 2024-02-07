import bpy

from ...models import EditMode, Editor, PosMapElement
from ...states import state
from ...utils.ui import redraw_area
from .current_pos import calculate_current_pos_index, update_current_pos_by_index
from .current_status import (
    calculate_current_status_index,
    update_current_status_by_index,
)
from .pos_editor import sync_editing_pos_frame_properties


def start_playing():
    # Update panel status
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


def stop_playing():
    # Update current index
    update_frame_index(bpy.context.scene.frame_current)
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})


# This part only handle the case when you pause the animation
# Similar logic is implemented in handlers/animation.py
def update_frame_index(current_frame: int):
    if state.edit_state == EditMode.EDITING:
        # This part only triggers when you pause the animation
        # at the exact frame you are editing
        # Very rare case, but still need to handle it
        detached = current_frame != state.current_editing_frame

        if not state.current_editing_detached and detached:
            state.current_editing_frame_synced = False

        state.current_editing_detached = detached

        if not detached and not state.current_editing_frame_synced:
            state.current_editing_frame = current_frame
            state.current_editing_frame_synced = True

            sync_editing_pos_frame_properties()

    # TODO: Increase efficiency
    match state.editor:
        case Editor.CONTROL_EDITOR:
            state.current_control_index = calculate_current_status_index()
            if state.edit_state == EditMode.IDLE:
                update_current_status_by_index()

        case Editor.POS_EDITOR:
            state.current_pos_index = calculate_current_pos_index()
            if state.edit_state == EditMode.IDLE:
                update_current_pos_by_index()

        case Editor.LED_EDITOR:
            pass


def insert_pos_frame(index: int, frame: PosMapElement):
    scene = bpy.context.scene
    dancer_names = state.dancer_names


def update_pos_frame():
    pass


def delete_pos_frame():
    pass
