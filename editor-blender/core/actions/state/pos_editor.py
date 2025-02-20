import bpy

from ....api.pos_agent import pos_agent
from ....properties.types import PositionPropertyType
from ...log import logger
from ...models import DancerName, EditingData, EditMode, Position
from ...states import state
from ...utils.algorithms import linear_interpolation
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .app_state import set_requesting
from .current_pos import update_current_pos_by_index
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
    pos_map = sorted(state.pos_map.values(), key=lambda elem: elem.start)
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
        )
    elif frame > pos_map[right].start:
        return (
            (frame, pos_map[right].pos[dancer_name]),
            (frame, pos_map[right].pos[dancer_name]),
        )
    return (
        (pos_map[left].start, pos_map[left].pos[dancer_name]),
        (pos_map[right].start, pos_map[right].pos[dancer_name]),
    )


async def add_pos_frame():
    if not bpy.context:
        return
    start = bpy.context.scene.frame_current

    show_dancer = state.show_dancers
    # Get current position data from ld_position
    positionData: list[list[float]] = []
    for index in range(len(state.dancer_names)):
        if not show_dancer[index]:
            neighbor_frame = pos_frame_neighbors(start, state.dancer_names[index])
            if neighbor_frame != None:
                new_position: list[float] = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
                location_attribute = ["x", "y", "z", "rx", "ry", "rz"]

                for index in range(3):
                    llocation = neighbor_frame[0][1].location
                    lpos = getattr(llocation, location_attribute[index])
                    ldist = start - neighbor_frame[0][0]
                    rlocation = neighbor_frame[1][1].location
                    rpos = getattr(rlocation, location_attribute[index])
                    rdist = neighbor_frame[1][0] - start
                    new_position[index] = linear_interpolation(lpos, ldist, rpos, rdist)
                for index in range(3, 6):
                    lrotation = neighbor_frame[0][1].rotation
                    lpos = getattr(lrotation, location_attribute[index])
                    ldist = start - neighbor_frame[0][0]
                    rrotation = neighbor_frame[1][1].rotation
                    rpos = getattr(rrotation, location_attribute[index])
                    rdist = neighbor_frame[1][0] - start
                    new_position[index] = linear_interpolation(lpos, ldist, rpos, rdist)

                positionData.append(new_position)
            else:
                positionData.append([0, 0, 0])
            continue

        dancer_name = state.dancer_names[index]
        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
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
        else:
            positionData.append([0, 0, 0, 0, 0, 0])

    set_requesting(True)
    try:
        id = await pos_agent.add_frame(start, positionData)
        notify("INFO", f"Added position frame: {id}")
    except:
        logger.exception("Failed to add position frame")
        notify("WARNING", "Cannot add position frame")

    set_requesting(False)


async def save_pos_frame(start: int | None = None):
    id = state.editing_data.frame_id
    show_dancer = state.show_dancers
    # Get current position data from ld_position
    positionData: list[list[float]] = []

    for index in range(len(state.dancer_names)):
        if not show_dancer[index]:
            pos = state.pos_map[id].pos[state.dancer_names[index]]
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
            continue

        dancer_name = state.dancer_names[index]
        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
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
        else:
            positionData.append([0, 0, 0, 0, 0, 0])

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
        logger.exception("Failed to save position frame")
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
        logger.exception("Failed to delete position frame")
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
        logger.exception("Failed to cancel edit position frame")
        notify("WARNING", "Cannot cancel edit")

    set_requesting(False)
