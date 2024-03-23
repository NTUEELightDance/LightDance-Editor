import traceback
from typing import List, Optional

import bpy

from ....api.pos_agent import pos_agent
from ....properties.types import PositionPropertyType
from ...models import EditingData, EditMode
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .app_state import set_requesting
from .current_pos import update_current_pos_by_index
from .pos_map import apply_pos_map_updates


def attach_editing_pos_frame():
    """Attach to editing frame and sync location to ld_position"""
    current_frame = state.current_editing_frame

    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    if current_frame != bpy.context.scene.frame_current:
        bpy.context.scene.frame_current = current_frame

    sync_editing_pos_frame_properties()


def sync_editing_pos_frame_properties():
    """Sync location to ld_position"""
    for dancer_name in state.dancer_names:
        # print(f"Syncing {dancer_name} to editing frame")
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            obj.location = ld_position.transform
            obj.rotation_euler = ld_position.rotation


async def add_pos_frame():
    start = bpy.context.scene.frame_current
    # Get current position data from ld_position
    positionData: List[List[float]] = []
    for dancer_name in state.dancer_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            positionData.append(
                [
                    ld_position.transform[0],
                    ld_position.transform[1],
                    ld_position.transform[2],
                ]
            )
        else:
            positionData.append([0, 0, 0])

    set_requesting(True)
    try:
        id = await pos_agent.add_frame(start, positionData)
        notify("INFO", f"Added position frame: {id}")
    except:
        traceback.print_exc()
        notify("WARNING", "Cannot add position frame")

    set_requesting(False)


async def save_pos_frame(start: Optional[int] = None):
    id = state.editing_data.frame_id
    # Get current position data from ld_position
    positionData: List[List[float]] = []

    for dancer_name in state.dancer_names:
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            positionData.append(
                [
                    ld_position.transform[0],
                    ld_position.transform[1],
                    ld_position.transform[2],
                ]
            )
        else:
            positionData.append([0, 0, 0])

    set_requesting(True)
    try:
        await pos_agent.save_frame(id, positionData, start=start)
        notify("INFO", f"Saved position frame: {id}")

        # Cancel editing
        ok = await pos_agent.cancel_edit(id)

        if ok is not None and ok:
            # Reset editing state
            state.current_editing_frame = -1
            state.current_editing_detached = False
            state.current_editing_frame_synced = False
            state.edit_state = EditMode.IDLE

            # Imediately apply changes produced by editing
            apply_pos_map_updates()

            redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        else:
            notify("WARNING", "Cannot exit editing")
    except:
        traceback.print_exc()
        notify("WARNING", "Cannot save position frame")

    set_requesting(False)


async def delete_pos_frame():
    index = state.current_pos_index
    id = state.pos_record[index]

    set_requesting(True)
    try:
        await pos_agent.delete_frame(id)
        notify("INFO", f"Deleted position frame: {id}")
    except:
        traceback.print_exc()
        notify("WARNING", "Cannot delete position frame")

    set_requesting(False)


async def request_edit_pos() -> bool:
    # if state.pos_map_pending:
    #     apply_pos_map_updates()

    index = state.current_pos_index
    pos_id = state.pos_record[index]
    pos_frame = state.pos_map[pos_id]

    set_requesting(True)
    ok = await pos_agent.request_edit(pos_id)
    set_requesting(False)

    if ok is not None and ok:
        # Init editing state
        state.current_editing_frame = pos_frame.start
        state.editing_data = EditingData(
            start=state.current_editing_frame, frame_id=pos_id, index=index
        )
        state.edit_state = EditMode.EDITING

        attach_editing_pos_frame()
        update_current_pos_by_index()

        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        return True
    else:
        notify("WARNING", "Cannot cancel edit")
        return False


async def cancel_edit_pos():
    index = state.current_pos_index
    id = state.pos_record[index]

    set_requesting(True)
    try:
        ok = await pos_agent.cancel_edit(id)

        if ok is not None and ok:
            # Revert modification
            update_current_pos_by_index()

            # Reset editing state
            state.current_editing_frame = -1
            state.current_editing_detached = False
            state.current_editing_frame_synced = False
            state.edit_state = EditMode.IDLE

            redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
        else:
            notify("WARNING", "Cannot cancel edit")

    except:
        traceback.print_exc()
        notify("WARNING", "Cannot cancel edit")

    set_requesting(False)
