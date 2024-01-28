import asyncio

import bpy

from ..core.actions.state.control_editor import sync_editing_control_frame_properties
from ..core.actions.state.current_pos import (
    calculate_current_pos_index,
    update_current_pos_by_index,
)
from ..core.actions.state.current_status import (
    calculate_current_status_index,
    update_current_status_by_index,
)
from ..core.actions.state.pos_editor import sync_editing_pos_frame_properties
from ..core.asyncio import AsyncTask
from ..core.models import EditMode, Editor
from ..core.states import state
from ..core.utils.operator import execute_operator


# This won't be triggered when pause animation
# Similar logic is implemented in core/actions/state/animation.py
def frame_change_pre(scene: bpy.types.Scene):
    if state.is_playing:
        return

    if state.edit_state == EditMode.EDITING:
        # When the frame is changed, check where the editing frame is attached
        # If it is attached, sync the properties
        current_frame = scene.frame_current
        detached = current_frame != state.current_editing_frame

        state.current_editing_detached = detached
        # Frame change is triggered twice when release control in timeline
        # so we need additional syncing
        state.current_editing_frame_synced = False

        if not detached and not state.current_editing_frame_synced:
            state.current_editing_frame = current_frame
            state.current_editing_frame_synced = True

            # Wait for animation update finishing
            # or the location will be reset to the original value
            async def defer():
                await asyncio.sleep(0.03)
                match state.editor:
                    case Editor.CONTROL_EDITOR:
                        sync_editing_control_frame_properties()
                    case Editor.POS_EDITOR:
                        sync_editing_pos_frame_properties()
                    case Editor.LED_EDITOR:
                        pass

            AsyncTask(defer).exec()

    # TODO: Increase efficiency
    current_frame = scene.frame_current
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


def mount():
    bpy.app.handlers.frame_change_post.append(frame_change_pre)
    # bpy.app.handlers.frame_change_pre.append(frame_change_pre)


def unmount():
    try:
        bpy.app.handlers.frame_change_post.remove(frame_change_pre)
        # bpy.app.handlers.frame_change_pre.remove(frame_change_pre)
    except:
        pass
