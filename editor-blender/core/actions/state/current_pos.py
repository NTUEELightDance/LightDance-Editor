from typing import Optional

import bpy

from ....properties.types import PositionPropertyType
from ...states import state
from ...utils.algorithms import binary_search


def calculate_current_pos_index() -> int:
    return binary_search(state.pos_start_record, bpy.context.scene.frame_current)


def update_current_pos_by_index():
    """Update current position by index and set ld_position"""
    index = state.current_pos_index

    pos_map = state.pos_map
    pos_id = state.pos_record[index]

    current_pos_map = pos_map.get(pos_id)
    if current_pos_map is None:
        return

    state.current_pos = current_pos_map.pos
    current_pos = state.current_pos

    if index == len(state.pos_record) - 1:
        for dancer_name in state.dancer_names:
            dancer_pos = current_pos.get(dancer_name)
            if dancer_pos is None:
                continue

            obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                # This also sets the actual location by update handler
                ld_position.transform = (dancer_pos.x, dancer_pos.y, dancer_pos.z)

    else:
        next_pos_id = state.pos_record[index + 1]
        next_pos_map = pos_map.get(next_pos_id)
        if next_pos_map is None:
            return

        next_pos = next_pos_map.pos

        frame = bpy.context.scene.frame_current
        current_start = current_pos_map.start
        next_start = next_pos_map.start

        for dancer_name in state.dancer_names:
            dancer_pos = current_pos.get(dancer_name)
            next_dancer_pos = next_pos.get(dancer_name)
            if dancer_pos is None or next_dancer_pos is None:
                continue

            obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
            ratio = (frame - current_start) / (next_start - current_start)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                # This also sets the actual location by update handler
                ld_position.transform = (
                    dancer_pos.x + (next_dancer_pos.x - dancer_pos.x) * ratio,
                    dancer_pos.y + (next_dancer_pos.y - dancer_pos.y) * ratio,
                    dancer_pos.z + (next_dancer_pos.z - dancer_pos.z) * ratio,
                )
