from typing import List, Tuple

from ...models import EditMode, MapID, PosMap, PosMapElement, PosRecord
from ...states import state
from ...utils.convert import pos_modify_to_animation_data
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import (
    modify_partial_pos_keyframes,
    reset_pos_frames,
    update_pos_frames,
)
from .current_pos import calculate_current_pos_index


def set_pos_map(pos_map: PosMap):
    state.pos_map = pos_map


def set_pos_record(pos_record: PosRecord):
    state.pos_record = pos_record


def add_pos(id: MapID, frame: PosMapElement):
    print(f"Add pos {id} at {frame.start}")

    pos_map_updates = state.pos_map_updates
    pos_map_updates.added.append((id, frame))

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Added position frame at {frame.start}")


def delete_pos(id: MapID):
    print(f"Delete pos {id}")

    old_frame = state.pos_map.get(id)
    if old_frame is None:
        return

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

    pos_map_updates.deleted.append((old_frame.start, id))

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Deleted position frame {id}")


def update_pos(id: MapID, frame: PosMapElement):
    print(f"Update pos {id} at {frame.start}")

    pos_map_updates = state.pos_map_updates

    for pos in pos_map_updates.added:
        if pos[0] == id:
            pos_map_updates.added.remove(pos)
            pos_map_updates.added.append((id, frame))
            return

    for pos in pos_map_updates.updated:
        if pos[0] == id:
            pos_map_updates.updated.remove(pos)
            pos_map_updates.updated.append((frame.start, id, frame))
            return

    pos_map_updates.updated.append((frame.start, id, frame))

    if (
        state.edit_state == EditMode.EDITING
        or not state.preferences.auto_sync
        or not state.ready
    ):
        state.pos_map_pending = True
        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    else:
        apply_pos_map_updates()
        notify("INFO", f"Updated position frame {id}")


def apply_pos_map_updates():
    if not state.ready:
        return

    pos_map_updates = state.pos_map_updates

    pos_update: List[Tuple[int, MapID, PosMapElement]] = []
    pos_add: List[Tuple[MapID, PosMapElement]] = []
    pos_delete: List[Tuple[int, MapID]] = []

    for id, pos in pos_map_updates.added:
        state.pos_map[id] = pos
        pos_add.append((id, pos))

    for _, id, pos in pos_map_updates.updated:
        state.pos_map[id] = pos
        pos_update.append((pos.start, id, pos))

    for _, id in pos_map_updates.deleted:
        frame = state.pos_map.get(id)
        if frame is None:
            continue

        pos_delete.append((frame.start, id))
        del state.pos_map[id]

    pos_map_updates.added.clear()
    pos_map_updates.updated.clear()
    pos_map_updates.deleted.clear()

    # Update pos record
    pos_record = list(state.pos_map.keys())
    pos_record.sort(key=lambda id: state.pos_map[id].start)

    pos_start_record = [state.pos_map[id].start for id in pos_record]

    state.pos_record = pos_record
    state.pos_start_record = pos_start_record

    # Update current pos index
    state.current_pos_index = calculate_current_pos_index()
    state.pos_map_pending = False

    # Update animation data
    pos_update.sort(key=lambda pos: pos[0])
    pos_add.sort(key=lambda pos: pos[1].start)
    pos_delete.sort(key=lambda pos: pos[0])

    # TODO:
    modify_animation_data = pos_modify_to_animation_data(
        pos_delete, pos_update, pos_add
    )
    modify_partial_pos_keyframes(modify_animation_data)

    # WARNING: This i buggy, use reset instead
    # delete_frames = [frame[0] for frame in pos_delete]
    # update_frames = [(frame[0], frame[2].start) for frame in pos_update]
    # add_frames = [frame[1].start for frame in pos_add]
    # update_pos_frames(delete_frames, update_frames, add_frames)
    reset_pos_frames()

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
