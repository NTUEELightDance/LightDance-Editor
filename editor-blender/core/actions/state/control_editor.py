from typing import List, Optional

import bpy

from ....api.control_agent import control_agent
from ....graphqls.mutations import MutDancerStatusPayload
from ....properties.types import LightType
from ...models import EditingData, EditMode, PartType
from ...states import state
from ...utils.convert import control_status_state_to_mut, rgb_to_float
from ...utils.notification import notify
from ...utils.ui import redraw_area
from .control_map import apply_control_map_updates
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
            part_obj_names: List[str] = [
                getattr(obj, "ld_part_name") for obj in part_objs
            ]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]
                part_type = getattr(part_obj, "ld_light_type")

                # Re-trigger update
                if part_type == LightType.FIBER.value:
                    ld_color: int = getattr(part_obj, "ld_color")
                    setattr(part_obj, "ld_color", ld_color)
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    setattr(part_obj, "ld_alpha", ld_alpha)

                elif part_type == LightType.LED.value:
                    ld_effect: int = getattr(part_obj, "ld_effect")
                    setattr(part_obj, "ld_effect", ld_effect)
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    setattr(part_obj, "ld_alpha", ld_alpha)


async def add_control_frame():
    start = bpy.context.scene.frame_current
    controlData = control_status_state_to_mut(state.current_status)

    try:
        await control_agent.add_frame(start, False, controlData)
        notify("INFO", f"Added control frame")
    except:
        notify("WARNING", "Cannot add control frame")


async def save_control_frame(start: Optional[int] = None):
    id = state.editing_data.frame_id

    fade: bool = getattr(bpy.context.window_manager, "ld_fade")
    # controlData = control_status_state_to_mut(state.current_status)

    controlData: List[MutDancerStatusPayload] = []
    default_color = list(state.color_map.keys())[0]

    for dancer in state.dancers_array:
        partControlData: MutDancerStatusPayload = []
        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer.name)

        if obj is not None:
            part_objs: List[bpy.types.Object] = getattr(obj, "children")
            part_obj_names: List[str] = [
                getattr(obj, "ld_part_name") for obj in part_objs
            ]

            for part in dancer.parts:
                if part.name not in part_obj_names:
                    if part.type == PartType.FIBER:
                        partControlData.append((default_color, 0))
                    elif part.type == PartType.LED:
                        partControlData.append((-1, 0))
                    continue

                part_index = part_obj_names.index(part.name)
                part_obj = part_objs[part_index]

                if part.type == PartType.FIBER:
                    color_id = part_obj["ld_color"]
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    partControlData.append((color_id, ld_alpha))
                elif part.type == PartType.LED:
                    effect_id = part_obj["ld_effect"]
                    ld_alpha: int = getattr(part_obj, "ld_alpha")
                    partControlData.append((effect_id, ld_alpha))

        else:
            for part in dancer.parts:
                if part.type == PartType.FIBER:
                    partControlData.append((default_color, 0))
                elif part.type == PartType.LED:
                    default_effect = list(state.led_map[part.name].values())[0].id
                    partControlData.append((default_effect, 0))

        controlData.append(partControlData)

    try:
        await control_agent.save_frame(id, controlData, fade=fade, start=start)
        notify("INFO", f"Saved control frame")

        # Imediately apply changes produced by editing
        # apply_control_map_updates()

        # Cancel editing
        ok = await control_agent.cancel_edit(id)
        if ok:
            # Reset editing state
            state.current_editing_frame = -1
            state.current_editing_detached = False
            state.current_editing_frame_synced = False
            state.edit_state = EditMode.IDLE

            redraw_area("VIEW_3D")
            redraw_area("DOPESHEET_EDITOR")
        else:
            notify("WARNING", "Cannot exit editing")
    except:
        notify("WARNING", "Cannot save control frame")


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
        state.editing_data = EditingData(
            start=state.current_editing_frame, frame_id=control_id, index=index
        )
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
