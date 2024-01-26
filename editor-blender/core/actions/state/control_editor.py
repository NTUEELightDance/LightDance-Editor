from typing import List, Optional

import bpy

from ....api.control_agent import control_agent
from ....properties.types import LightType
from ...models import EditMode
from ...states import state
from ...utils.convert import rgb_to_float
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .current_status import update_current_status_by_index


def attach_editing_control_frame():
    """Attach to editing frame and sync location to ld_position"""
    current_frame = state.current_editing_frame

    state.current_editing_detached = False
    state.current_editing_frame_synced = True

    if current_frame != bpy.context.scene.frame_current:
        bpy.context.scene.frame_set(current_frame)

    sync_editing_control_frame_properties()


def sync_editing_control_frame_properties():
    """Sync location to ld_position"""
    for dancer in state.dancers_array:
        dancer_obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer.name)
        if dancer_obj is not None:
            part_objs: List[bpy.types.Object] = getattr(dancer_obj, "children")
            part_obj_names: List[str] = [obj.name for obj in part_objs]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]
                part_type = getattr(part_obj, "ld_light_type")

                if part_type == LightType.FIBER.value:
                    color_id = part_obj["ld_color"]
                    color = state.color_map[color_id]
                    ld_alpha: int = getattr(part_obj, "ld_alpha")

                    color_float = rgb_to_float((*color.rgb, ld_alpha))
                    part_obj.color[0] = color_float[0]
                    part_obj.color[1] = color_float[1]
                    part_obj.color[2] = color_float[2]
                    part_obj.color[3] = color_float[3]
                elif part_type == LightType.LED.value:
                    pass


async def add_control_frame():
    pass


#     start = bpy.context.scene.frame_current
#     # Get current position data from ld_position
#     positionData: List[List[float]] = []
#     for dancer_name in state.dancer_names:
#         obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
#         if obj is not None:
#             ld_position: PositionPropertyType = getattr(obj, "ld_position")
#             positionData.append(
#                 [
#                     ld_position.transform[0],
#                     ld_position.transform[1],
#                     ld_position.transform[2],
#                 ]
#             )
#         else:
#             positionData.append([0, 0, 0])
#
#     try:
#         id = await pos_agent.add_frame(start, positionData)
#         notify("INFO", f"Added position frame: {id}")
#     except:
#         notify("WARNING", "Cannot add position frame")


async def save_control_frame():
    pass


#     index = state.current_pos_index
#     id = state.pos_record[index]
#     # Get current position data from ld_position
#     positionData: List[List[float]] = []
#     for dancer_name in state.dancer_names:
#         obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
#         if obj is not None:
#             ld_position: PositionPropertyType = getattr(obj, "ld_position")
#             positionData.append(
#                 [
#                     ld_position.transform[0],
#                     ld_position.transform[1],
#                     ld_position.transform[2],
#                 ]
#             )
#         else:
#             positionData.append([0, 0, 0])
#
#     try:
#         await pos_agent.save_frame(id, positionData)
#         notify("INFO", f"Saved position frame: {id}")
#
#         # Imediately apply changes produced by editing
#         apply_pos_map_updates()
#
#         # Cancel editing
#         ok = await pos_agent.cancel_edit(id)
#         if ok:
#             # Reset editing state
#             state.current_editing_frame = -1
#             state.current_editing_detached = False
#             state.current_editing_frame_synced = False
#             state.edit_state = EditMode.IDLE
#
#             redraw_area("VIEW_3D")
#         else:
#             notify("WARNING", "Cannot exit editing")
#     except:
#         notify("WARNING", "Cannot save position frame")


async def delete_control_frame():
    index = state.current_control_index
    id = state.control_record[index]

    try:
        await control_agent.delete_frame(id)
        notify("INFO", f"Deleted control frame: {id}")
    except:
        notify("WARNING", "Cannot delete control frame")


async def request_edit_control():
    index = state.current_control_index
    control_id = state.control_record[index]
    control_frame = state.control_map[control_id]

    ok = await control_agent.request_edit(control_id)
    if ok:
        # Init editing state
        state.current_editing_frame = control_frame.start
        state.edit_state = EditMode.EDITING

        attach_editing_control_frame()
        update_current_status_by_index()

        redraw_area("VIEW_3D")
        redraw_area("DOPESHEET_EDITOR")
    else:
        notify("WARNING", "Cannot cancel edit")


async def cancel_edit_control():
    index = state.current_control_index
    id = state.control_record[index]

    ok = await control_agent.cancel_edit(id)
    if ok:
        # Revert modification
        update_current_status_by_index()

        # Reset editing state
        state.current_editing_frame = -1
        state.current_editing_detached = False
        state.current_editing_frame_synced = False
        state.edit_state = EditMode.IDLE

        redraw_area("VIEW_3D")
        redraw_area("DOPESHEET_EDITOR")
    else:
        notify("WARNING", "Cannot cancel edit")
