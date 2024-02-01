from ...models import EditMode, MapID, PosMap, PosMapElement, PosRecord
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .current_pos import calculate_current_pos_index, update_current_pos_by_index


def set_pos_map(pos_map: PosMap):
    state.pos_map = pos_map


def set_pos_record(pos_record: PosRecord):
    state.pos_record = pos_record


def add_pos(id: MapID, frame: PosMapElement):
    pos_map_updates = state.pos_map_updates
    pos_map_updates.added.append((id, frame))

    if state.edit_state == EditMode.EDITING:
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Added position frame at {frame.start}")


def delete_pos(id: MapID):
    pos_map_updates = state.pos_map_updates

    for pos in pos_map_updates.added:
        if pos[0] == id:
            pos_map_updates.added.remove(pos)

            if (
                len(pos_map_updates.added) == 0
                or len(pos_map_updates.updated) == 0
                or len(pos_map_updates.deleted) == 0
            ):
                state.pos_map_pending = False

            return

    for pos in pos_map_updates.updated:
        if pos[0] == id:
            pos_map_updates.updated.remove(pos)

    pos_map_updates.deleted.append(id)

    if state.edit_state == EditMode.EDITING:
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Deleted position frame {id}")


def update_pos(id: MapID, frame: PosMapElement):
    pos_map_updates = state.pos_map_updates

    for pos in pos_map_updates.added:
        if pos[0] == id:
            pos_map_updates.added.remove(pos)
            pos_map_updates.added.append((id, frame))
            return

    for pos in pos_map_updates.updated:
        if pos[0] == id:
            pos_map_updates.updated.remove(pos)
            pos_map_updates.updated.append((id, frame))
            return

    pos_map_updates.updated.append((id, frame))

    if state.edit_state == EditMode.EDITING:
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Updated position frame {id}")


def apply_pos_map_updates():
    pos_map_updates = state.pos_map_updates

    # TODO: Update animation data

    for pos in pos_map_updates.added:
        state.pos_map[pos[0]] = pos[1]

    for pos in pos_map_updates.updated:
        state.pos_map[pos[0]] = pos[1]

    for pos_id in pos_map_updates.deleted:
        del state.pos_map[pos_id]

    pos_map_updates.added.clear()
    pos_map_updates.updated.clear()
    pos_map_updates.deleted.clear()

    # Update pos record
    pos_record = list(state.pos_map.keys())
    pos_record.sort(key=lambda id: state.pos_map[id].start)

    state.pos_record = pos_record

    # Update current pos index
    state.current_pos_index = calculate_current_pos_index()
    update_current_pos_by_index()

    state.pos_map_pending = False
    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
