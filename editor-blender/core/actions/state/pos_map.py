import bpy

from ...log import logger
from ...models import EditMode, MapID, PosMap, PosMapElement, PosRecord
from ...states import state
from ...utils.convert import pos_modify_to_animation_data
from ...utils.notification import notify
from ...utils.ui import redraw_area
from ..property.animation_data import (
    modify_partial_pos_keyframes,
    reset_pos_frames,
    reset_pos_rev,
)
from .current_pos import calculate_current_pos_index
from .dopesheet import update_pos_seq


def set_pos_map(pos_map_modified: PosMap):
    state.pos_map_MODIFIED = pos_map_modified


def set_pos_record(pos_record: PosRecord):
    state.pos_record = pos_record


def add_pos(id: MapID, frame: PosMapElement):
    logger.info(f"Add pos {id} at {frame.start}")

    pos_map_updates = state.pos_map_updates
    pos_map_updates.added[id] = frame

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
    logger.info(f"Delete pos {id}")

    old_frame = state.pos_map_MODIFIED.get(id)
    if old_frame is None:
        return

    pos_map_updates = state.pos_map_updates

    for added_id, _ in pos_map_updates.added.items():
        if added_id == id:
            pos_map_updates.added.pop(added_id)

            if (
                len(pos_map_updates.added) == 0
                or len(pos_map_updates.updated) == 0
                or len(pos_map_updates.deleted) == 0
            ):
                state.pos_map_pending = False

            return

    for updated_id, _ in pos_map_updates.updated.items():
        if updated_id == id:
            pos_map_updates.updated.pop(updated_id)

    pos_map_updates.deleted[id] = old_frame.start

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
    logger.info(f"Update pos {id} at {frame.start}")

    pos_map_updates = state.pos_map_updates

    for add_id, _ in pos_map_updates.added.items():
        if add_id == id:
            pos_map_updates.added.pop(add_id)
            pos_map_updates.added[id] = frame
            return

    for updated_id, _ in pos_map_updates.updated.items():
        if updated_id == id:
            old_frame = state.pos_map_MODIFIED[id]
            pos_map_updates.updated.pop(updated_id)
            pos_map_updates.updated[id] = (old_frame.start, frame)
            return

    pos_map_updates.updated[id] = (state.pos_map_MODIFIED[id].start, frame)

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
        if not bpy.context or not state.pos_map_MODIFIED:
            return

    pos_map_updates = state.pos_map_updates

    # Update animation data
    updated = sorted(
        [(start, id, frame) for id, (start, frame) in pos_map_updates.updated.items()],
        key=lambda x: x[0],
    )
    added = sorted(
        [(id, frame) for id, frame in pos_map_updates.added.items()],
        key=lambda x: x[1].start,
    )
    deleted = sorted(
        [(start, id) for id, start in pos_map_updates.deleted.items()],
        key=lambda x: x[0],
    )

    # TODO:
    modify_animation_data = pos_modify_to_animation_data(deleted, updated, added)
    modify_partial_pos_keyframes(modify_animation_data)

    # Update control map
    for id, frame in added:
        state.pos_map_MODIFIED[id] = frame
    for _, id, frame in updated:
        state.pos_map_MODIFIED[id] = frame
    for _, id in deleted:
        state.pos_map_MODIFIED.pop(id)

    # Update pos record
    pos_record = list(state.pos_map_MODIFIED.keys())
    pos_record.sort(key=lambda id: state.pos_map_MODIFIED[id].start)

    pos_start_record = [state.pos_map_MODIFIED[id].start for id in pos_record]

    state.pos_record = pos_record
    state.pos_start_record = pos_start_record

    # Update current pos index
    state.current_pos_index = calculate_current_pos_index()
    state.pos_map_pending = False

    # Update pos sequence
    update_pos_seq(updated, added, deleted)

    pos_map_updates.added.clear()
    pos_map_updates.updated.clear()
    pos_map_updates.deleted.clear()

    # WARNING: This i buggy, use reset instead
    # delete_frames = [frame[0] for frame in pos_delete]
    # update_frames = [(frame[0], frame[2].start) for frame in pos_update]
    # add_frames = [frame[1].start for frame in pos_add]
    # update_pos_frames(delete_frames, update_frames, add_frames)
    sorted_pos_map = sorted(
        state.pos_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    reset_pos_frames()
    reset_pos_rev(sorted_pos_map)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
