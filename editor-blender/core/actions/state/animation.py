import bpy

from ...models import EditMode, Editor
from ...states import state
from ...utils.ui import redraw_area
from .control_editor import sync_editing_control_frame_properties
from .current_pos import calculate_current_pos_index
from .current_status import calculate_current_status_index
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

            match state.editor:
                case Editor.CONTROL_EDITOR:
                    sync_editing_control_frame_properties()
                case Editor.POS_EDITOR:
                    sync_editing_pos_frame_properties()
                case Editor.LED_EDITOR:
                    pass

    match state.editor:
        case Editor.CONTROL_EDITOR:
            setattr(
                bpy.context.window_manager,
                "ld_current_frame_index",
                str(calculate_current_status_index()),
            )

        case Editor.POS_EDITOR:
            setattr(
                bpy.context.window_manager,
                "ld_current_frame_index",
                str(calculate_current_pos_index()),
            )

        case Editor.LED_EDITOR:
            pass
