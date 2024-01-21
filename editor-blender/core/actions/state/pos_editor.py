import asyncio
from typing import List, Optional

import bpy

from ....api.pos_agent import pos_agent
from ....properties.types import PositionPropertyType
from ...models import EditMode
from ...states import state
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .current_pos import calculate_current_pos_index, update_current_pos_by_index
from .pos_map import apply_pos_map_updates


def attach_editing_pos_frame():
    """Attach to editing frame and sync location to ld_position"""
    current_frame = state.current_editing_frame

    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    if current_frame != bpy.context.scene.frame_current:
        bpy.context.scene.frame_set(current_frame)

    sync_editing_pos_frame_properties()


def sync_editing_pos_frame_properties():
    """Sync location to ld_position"""
    for dancer_name in state.dancer_names:
        # print(f"Syncing {dancer_name} to editing frame")
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")

            # print(f"Update {dancer_name} to {ld_position.transform}")
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

    try:
        id = await pos_agent.add_frame(start, positionData)
        notify("INFO", f"Added position frame: {id}")
    except:
        notify("WARNING", "Cannot add position frame")


async def save_pos_frame():
    index = state.current_pos_index
    id = state.pos_record[index]
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

    try:
        await pos_agent.save_frame(id, positionData)
        notify("INFO", f"Saved position frame: {id}")

        # Imediately apply changes produced by editing
        apply_pos_map_updates()

        # Cancel editing
        ok = await pos_agent.cancel_edit(id)
        if ok:
            # Reset editing state
            state.current_editing_frame = -1
            state.current_editing_detached = False
            state.current_editing_frame_synced = False
            state.edit_state = EditMode.IDLE

            redraw_area("VIEW_3D")
        else:
            notify("WARNING", "Cannot exit editing")
    except:
        notify("WARNING", "Cannot save position frame")


async def delete_pos_frame():
    index = state.current_pos_index
    id = state.pos_record[index]

    try:
        await pos_agent.delete_frame(id)
        notify("INFO", f"Deleted position frame: {id}")
    except:
        notify("WARNING", "Cannot delete position frame")


async def request_edit_pos():
    index = state.current_pos_index
    pos_id = state.pos_record[index]
    pos_frame = state.pos_map[pos_id]

    ok = await pos_agent.request_edit(pos_id)
    if ok:
        # Init editing state
        state.current_editing_frame = pos_frame.start
        state.edit_state = EditMode.EDITING

        attach_editing_pos_frame()
        update_current_pos_by_index()

        redraw_area("VIEW_3D")
    else:
        notify("WARNING", "Cannot cancel edit")


async def cancel_edit_pos():
    index = state.current_pos_index
    id = state.pos_record[index]

    ok = await pos_agent.cancel_edit(id)
    if ok:
        # Revert modification
        update_current_pos_by_index()

        # Reset editing state
        state.current_editing_frame = -1
        state.current_editing_detached = False
        state.current_editing_frame_synced = False
        state.edit_state = EditMode.IDLE

        redraw_area("VIEW_3D")
    else:
        notify("WARNING", "Cannot cancel edit")