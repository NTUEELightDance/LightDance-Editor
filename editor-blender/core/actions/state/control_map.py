from ...models import ControlMap, ControlMapElement, ControlRecord, EditMode, MapID
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import (
    add_single_ctrl_keyframe,
    delete_single_ctrl_keyframe,
    edit_single_ctrl_keyframe,
)
from .current_status import (
    calculate_current_status_index,
    update_current_status_by_index,
)


def set_control_map(control_map: ControlMap):
    state.control_map = control_map


def set_control_record(control_record: ControlRecord):
    state.control_record = control_record


def add_control(id: MapID, frame: ControlMapElement):
    control_map_updates = state.control_map_updates
    control_map_updates.added.append((id, frame))

    if state.edit_state == EditMode.EDITING:
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Added control frame {id}")


def delete_control(id: MapID):
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

    control_map_updates.deleted.append(id)

    if state.edit_state == EditMode.EDITING:
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Deleted control frame {id}")


def update_control(id: MapID, frame: ControlMapElement):
    control_map_updates = state.control_map_updates

    for status in control_map_updates.added:
        if status[0] == id:
            control_map_updates.added.remove(status)
            control_map_updates.added.append((id, frame))
            return

    for status in control_map_updates.updated:
        if status[0] == id:
            control_map_updates.updated.remove(status)
            control_map_updates.updated.append((id, frame))
            return

    control_map_updates.updated.append((id, frame))

    if state.edit_state == EditMode.EDITING:
        state.control_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_control_map_updates()
        notify("INFO", f"Updated control frame {id}")


def apply_control_map_updates():
    control_map_updates = state.control_map_updates

    for status in control_map_updates.added:
        add_single_ctrl_keyframe(status[0], status[1])
        state.control_map[status[0]] = status[1]

    for status in control_map_updates.updated:
        edit_single_ctrl_keyframe(status[0], status[1])
        state.control_map[status[0]] = status[1]

    for id in control_map_updates.deleted:
        delete_single_ctrl_keyframe(id)
        del state.control_map[id]

    control_map_updates.added.clear()
    control_map_updates.updated.clear()
    control_map_updates.deleted.clear()

    # Update control record
    control_record = list(state.control_map.keys())
    control_record.sort(key=lambda id: state.control_map[id].start)

    state.control_record = control_record

    # Update current control index
    state.current_control_index = calculate_current_status_index()
    update_current_status_by_index()

    state.control_map_pending = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
