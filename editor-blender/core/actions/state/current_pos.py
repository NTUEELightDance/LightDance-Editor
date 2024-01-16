from typing import Optional

import bpy

from ....properties.types import PositionPropertyType
from ...states import state


def update_current_pos_by_index(index: int):
    state.current_pos_index = index

    pos_map = state.pos_map
    pos_id = state.pos_record[index]

    current_pos_map = pos_map.get(pos_id)
    if current_pos_map is None:
        return

    state.current_pos = current_pos_map.pos
    current_pos = state.current_pos

    for dancer_name in state.dancer_names:
        dancer_pos = current_pos.get(dancer_name)
        if dancer_pos is None:
            continue

        obj: Optional[bpy.types.Object] = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            ld_position.transform = (dancer_pos.x, dancer_pos.y, dancer_pos.z)
            print(f"Update {dancer_name} to {ld_position.transform}")
