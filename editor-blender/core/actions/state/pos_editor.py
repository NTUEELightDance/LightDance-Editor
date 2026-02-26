import json
from typing import cast

import bpy

from ....api.pos_agent import pos_agent
from ....properties.types import PositionPropertyType
from ...log import logger
from ...models import DancerName, EditingData, EditMode, Position
from ...states import state
from ...utils.algorithms import linear_interpolation
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .app_state import send_request
from .current_pos import _init_pos_y, update_current_pos_by_index
from .pos_map import apply_pos_map_updates


def attach_editing_pos_frame():
    """Attach to editing frame and sync location to ld_position"""
    if not bpy.context:
        return
    current_frame = state.current_editing_frame

    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    if current_frame != bpy.context.scene.frame_current:
        bpy.context.scene.frame_current = current_frame

    sync_editing_pos_frame_properties()


def sync_editing_pos_frame_properties():
    """Sync location to ld_position"""

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer_name in state.dancer_names:
        if not show_dancer_dict[dancer_name]:
            continue

        # print(f"Syncing {dancer_name} to editing frame")
        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            obj.location = ld_position.location
            obj.rotation_euler = ld_position.rotation


def pos_frame_neighbors(
    frame: int, dancer_name: DancerName
) -> tuple[tuple[int, Position], tuple[int, Position]] | None:
    pos_map = sorted(state.pos_map_MODIFIED.values(), key=lambda elem: elem.start)
    if len(pos_map) == 0:
        return None

    left, right = 0, len(pos_map) - 1
    while right - left > 1:
        mid = (right + left) // 2
        if pos_map[mid].start > frame:
            right = mid
        elif pos_map[mid].start < frame:
            left = mid
        else:
            right = mid
            left = mid
            break

    if frame < pos_map[left].start:
        return (
            (frame, pos_map[left].pos[dancer_name]),
            (frame, pos_map[left].pos[dancer_name]),
        )  # type: ignore
    elif frame > pos_map[right].start:
        return (
            (frame, pos_map[right].pos[dancer_name]),
            (frame, pos_map[right].pos[dancer_name]),
        )  # type: ignore
    return (
        (pos_map[left].start, pos_map[left].pos[dancer_name]),
        (pos_map[right].start, pos_map[right].pos[dancer_name]),
    )  # type: ignore


async def add_pos_frame():
    if not bpy.context:
        return
    start = bpy.context.scene.frame_current

    show_dancer = state.show_dancers
    # Get position data: None for all dancers, will use neighbor frames for interpolation
    positionData: list[list[float] | None] = []
    for index in range(len(state.dancer_names)):
        positionData.append(None)

    positionDataPrime: list[list[float]] = []
    hasPositionData: list[bool] = []
    for index in range(len(state.dancer_names)):
        positionDataPrime.append([0.0, 0.0, 0.0, 0.0, 0.0, 0.0])
        hasPositionData.append(False)

    with send_request():
        try:
            id = await pos_agent.add_frame(start, positionDataPrime, hasPositionData)
            notify("INFO", f"Added position frame: {id}")
        except:
            logger.exception("Failed to add position frame")
            notify("WARNING", "Cannot add position frame")


async def save_pos_frame(start: int | None = None):
    id = state.editing_data.frame_id
    show_dancer = state.show_dancers
    # Get current position data from ld_position
    positionData: list[list[float]] = []
    hasEffectData: list[bool] = []
    for index in range(len(state.dancer_names)):
        if not show_dancer[index]:
            pos = state.pos_map_MODIFIED[id].pos[state.dancer_names[index]]
            if pos is None:
                positionData.append([0, 0, 0, 0, 0, 0])
                hasEffectData.append(False)
            else:
                positionData.append(
                    [
                        pos.location.x,
                        pos.location.y,
                        pos.location.z,
                        pos.rotation.rx,
                        pos.rotation.ry,
                        pos.rotation.rz,
                    ]
                )
                hasEffectData.append(True)
            continue

        dancer_name = state.dancer_names[index]
        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            if getattr(ld_position, "is_none", False):
                positionData.append([0, 0, 0, 0, 0, 0])
                hasEffectData.append(False)
            else:
                positionData.append(
                    [
                        ld_position.location[0],
                        ld_position.location[1],
                        ld_position.location[2],
                        ld_position.rotation[0],
                        ld_position.rotation[1],
                        ld_position.rotation[2],
                    ]
                )
                hasEffectData.append(True)
        else:
            positionData.append([0, 0, 0, 0, 0, 0])
            hasEffectData.append(True)

    with send_request():
        try:
            await pos_agent.save_frame(id, positionData, hasEffectData, start=start)
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
                update_current_pos_by_index()
                sync_editing_pos_frame_properties()
                redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
            else:
                notify("WARNING", "Cannot exit editing")
        except:
            logger.exception("Failed to save position frame")
            notify("WARNING", "Cannot save position frame")


async def delete_pos_frame():
    index = state.current_pos_index
    id = state.pos_record[index]

    # Get the frame data
    frame = state.pos_map_MODIFIED.get(id)
    if frame is None:
        notify("WARNING", "Frame not found")
        return

    with send_request():
        try:
            await pos_agent.delete_frame(id, state.show_dancers)
            notify("INFO", f"Deleted position frame: {id}")

            # apply_pos_map_updates()
            # update_current_pos_by_index()
        except Exception as e:
            e_str = str(e)
            e_json = json.loads(e_str)
            if e_json["message"].startswith("The target frame is being edited by user"):
                notify("WARNING", "Delete frame rejected, for the frame is being edit")
            else:
                logger.exception("Failed to delete position frame")
                notify("WARNING", "Cannot delete position frame")
    return
    # show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))

    # shown_dancer_names = [
    #     dancer_name
    #     for dancer_name in state.dancer_names
    #     if show_dancer_dict.get(dancer_name, False)
    # ]
    # hidden_dancer_names = [
    #     dancer_name
    #     for dancer_name in state.dancer_names
    #     if not show_dancer_dict.get(dancer_name, False)
    # ]

    # # If all hidden dancers are None state -> delete frame
    # hidden_all_none = True
    # for dancer_name in hidden_dancer_names:
    #     pos = frame.pos.get(dancer_name)
    #     if not pos is None:
    #         hidden_all_none = False
    #         break

    # if hidden_all_none:
    #     with send_request():
    #         try:
    #             await pos_agent.delete_frame(id)
    #             notify("INFO", f"Deleted position frame: {id}")

    #             # apply_pos_map_updates()
    #             # update_current_pos_by_index()
    #         except Exception:
    #             logger.exception("Failed to delete position frame")
    #             notify("WARNING", "Cannot delete position frame")
    #     return

    # # There exists hidden dancer with non-None state -> set all shown dancers to None state.
    # with send_request():
    #     ok = await request_edit_pos()
    #     if not ok:
    #         return

    #     for dancer_name in shown_dancer_names:
    #         obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
    #         if obj is None:
    #             continue
    #         ld_position: PositionPropertyType = getattr(obj, "ld_position")
    #         setattr(ld_position, "is_none", True)

    #     await save_pos_frame()


async def request_edit_pos() -> bool:
    # if state.pos_map_pending:
    #     apply_pos_map_updates()

    index = state.current_pos_index
    pos_id = state.pos_record[index]
    pos_frame = state.pos_map_MODIFIED[pos_id]

    with send_request():
        ok = await pos_agent.request_edit(pos_id)

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

    with send_request():
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
            logger.exception("Failed to cancel edit position frame")
            notify("WARNING", "Cannot cancel edit")
