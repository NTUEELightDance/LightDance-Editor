import bpy

from ...log import logger
from ...models import ControlMap, ControlMapElement, ControlRecord, EditMode, MapID
from ...states import state
from ...utils.convert import control_modify_to_animation_data
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import (
    modify_partial_ctrl_keyframes,
    reset_control_frames_and_fade_sequence,
    reset_ctrl_rev,
)
from .current_status import calculate_current_status_index
from .dopesheet import update_fade_seq


def set_control_map(control_map: ControlMap):
    state.control_map = control_map


def set_control_record(control_record: ControlRecord):
    state.control_record = control_record


def add_control(id: MapID, frame: ControlMapElement):
    logger.info(f"Add control {id} at {frame.start}")

    control_map_updates = state.control_map_updates
    control_map_updates.added[id] = frame

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Added control frame {id}")


def delete_control(id: MapID):
    logger.info(f"Delete control {id}")

    control_map_updates = state.control_map_updates

    if id in control_map_updates.updated:
        control_map_updates.updated.pop(id)

    if id in control_map_updates.added:
        control_map_updates.added.pop(id)

        if (
            len(control_map_updates.added) == 0
            or len(control_map_updates.updated) == 0
            or len(control_map_updates.deleted) == 0
        ):
            state.control_map_pending = False

        print("KILLER:", control_map_updates)
        return

    old_frame = state.control_map.get(id)
    if old_frame is None:
        return

    control_map_updates.deleted[id] = old_frame.start

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Deleted control frame {id}")


def update_control(id: MapID, frame: ControlMapElement):
    logger.info(f"Update control {id} at {frame.start}")

    control_map_updates = state.control_map_updates

    for added_id, _ in control_map_updates.added.items():
        if added_id == id:
            control_map_updates.added.pop(added_id)
            control_map_updates.added[id] = frame
            return

    for updated_id, _ in control_map_updates.updated.items():
        if updated_id == id:
            old_frame = state.control_map[id]
            control_map_updates.updated.pop(updated_id)
            control_map_updates.updated[id] = (old_frame.start, frame)
            return

    control_map_updates.updated[id] = (frame.start, frame)
    # for id, (start, _) in control_map_updates.updated.items():
    #     print(f"Updated control {id} at {start}")

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Updated control frame {id}")


def apply_control_map_updates():
    if not state.ready:
        return

    control_map_updates = state.control_map_updates

    # Update animation data
    updated = sorted(
        [
            (start, id, frame)
            for id, (start, frame) in control_map_updates.updated.items()
            if id not in state.not_loaded_control_frames
        ],
        key=lambda x: x[0],
    )
    added = sorted(
        [
            (id, frame)
            for id, frame in control_map_updates.added.items()
            if id not in state.not_loaded_control_frames
        ],
        key=lambda x: x[1].start,
    )
    deleted = sorted(
        [(start, id) for id, start in control_map_updates.deleted.items()],
        key=lambda x: x[0],
    )
    print(state.control_map_updates)
    print(updated, added, deleted)
    modify_animation_data, no_change_dict = control_modify_to_animation_data(
        deleted, updated, added
    )
    modify_partial_ctrl_keyframes(modify_animation_data, no_change_dict)

    # Update control map
    for _, id in deleted:
        state.control_map.pop(id)
    for id, frame in added:
        state.control_map[id] = frame
    for _, id, frame in updated:
        state.control_map[id] = frame

    # Update control record
    control_record = list(state.control_map.keys())
    control_record.sort(key=lambda id: state.control_map[id].start)

    control_start_record = [state.control_map[id].start for id in control_record]

    state.control_record = control_record
    state.control_start_record = control_start_record

    # Update current control index
    state.current_control_index = calculate_current_status_index()
    state.control_map_pending = False

    # Update fade sequence
    update_fade_seq(updated, added, deleted)

    control_map_updates.added.clear()
    control_map_updates.updated.clear()
    control_map_updates.deleted.clear()

    sorted_ctrl_map = sorted(state.control_map.items(), key=lambda item: item[1].start)
    reset_ctrl_rev(sorted_ctrl_map)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
