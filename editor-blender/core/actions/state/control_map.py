from typing import List, Tuple

from ...models import ControlMap, ControlMapElement, ControlRecord, EditMode, MapID
from ...states import state
from ...utils.convert import control_modify_to_animation_data
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import (
    modify_partial_ctrl_keyframes,
    reset_control_frames_and_fade_sequence,
    update_control_frames_and_fade_sequence,
)
from .current_status import calculate_current_status_index


def set_control_map(control_map: ControlMap):
    state.control_map = control_map


def set_control_record(control_record: ControlRecord):
    state.control_record = control_record


def add_control(id: MapID, frame: ControlMapElement):
    print(f"Add control {id} at {frame.start}")

    control_map_updates = state.control_map_updates
    control_map_updates.added.append((id, frame))

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
    print(f"Delete control {id}")

    old_frame = state.control_map.get(id)
    if old_frame is None:
        return

    control_map_updates = state.control_map_updates

    for status in control_map_updates.added:
        if status[0] == id:
            control_map_updates.added.remove(status)

            if (
                len(control_map_updates.added) == 0
                or len(control_map_updates.updated) == 0
                or len(control_map_updates.deleted) == 0
            ):
                state.control_map_pending = False

            return

    for status in control_map_updates.updated:
        if status[0] == id:
            control_map_updates.updated.remove(status)

    control_map_updates.deleted.append((old_frame.start, id))

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
    print(f"Update control {id} at {frame.start}")

    control_map_updates = state.control_map_updates

    for status in control_map_updates.added:
        if status[0] == id:
            control_map_updates.added.remove(status)
            control_map_updates.added.append((id, frame))
            return

    for status in control_map_updates.updated:
        if status[0] == id:
            control_map_updates.updated.remove(status)
            control_map_updates.updated.append((frame.start, id, frame))
            return

    control_map_updates.updated.append((frame.start, id, frame))

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

    control_update: List[Tuple[int, MapID, ControlMapElement]] = []
    control_add: List[Tuple[MapID, ControlMapElement]] = []
    control_delete: List[Tuple[int, MapID]] = []

    for id, status in control_map_updates.added:
        state.control_map[id] = status
        control_add.append((id, status))

    for _, id, status in control_map_updates.updated:
        state.control_map[id] = status
        control_update.append((status.start, id, status))

    for _, id in control_map_updates.deleted:
        frame = state.control_map.get(id)
        if frame is None:
            continue

        control_delete.append((frame.start, id))
        del state.control_map[id]

    control_map_updates.added.clear()
    control_map_updates.updated.clear()
    control_map_updates.deleted.clear()

    # Update control record
    control_record = list(state.control_map.keys())
    control_record.sort(key=lambda id: state.control_map[id].start)

    control_start_record = [state.control_map[id].start for id in control_record]

    state.control_record = control_record
    state.control_start_record = control_start_record

    # Update current control index
    state.current_control_index = calculate_current_status_index()
    state.control_map_pending = False

    # Update animation data
    control_update.sort(key=lambda x: x[0])
    control_add.sort(key=lambda x: x[1].start)
    control_delete.sort(key=lambda x: x[0])

    # TODO: Implement new add, update, delete so we don't need to add, update, delete all the time
    modify_animation_data = control_modify_to_animation_data(
        control_delete, control_update, control_add
    )
    modify_partial_ctrl_keyframes(modify_animation_data)

    # WARNING: This i buggy, use reset instead
    # sorted_ctrl_map = sorted(state.control_map.items(), key=lambda item: item[1].start)
    # fade_seq = [(frame.start, frame.fade) for _, frame in sorted_ctrl_map]
    #
    # delete_frames = [frame[0] for frame in control_delete]
    # update_frames = [(frame[0], frame[2].start) for frame in control_update]
    # add_frames = [frame[1].start for frame in control_add]
    # update_control_frames_and_fade_sequence(
    #     delete_frames, update_frames, add_frames, fade_seq
    # )
    sorted_ctrl_map = sorted(state.control_map.items(), key=lambda item: item[1].start)
    fade_seq = [(frame.start, frame.fade) for _, frame in sorted_ctrl_map]
    reset_control_frames_and_fade_sequence(fade_seq)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
