import bpy

from ....properties.types import PositionPropertyType
from ...states import state
from ...utils.algorithms import binary_search


def calculate_current_pos_index() -> int:
    if not bpy.context:
        return 0  # Won't actually happen
    return binary_search(state.pos_start_record, bpy.context.scene.frame_current)


def _init_pos_y(index: float, total: float):
    if total == 1:
        return 0.0

    total_length = total - 1.0
    half_length = total_length / 2.0
    left_point = -half_length
    right_point = half_length

    x = (left_point * (total_length - index) + right_point * index) / total_length
    return x


def _set_default_position():
    dancer_num = len(state.dancer_names)
    for index, dancer_name in enumerate(state.dancer_names):
        init_y = _init_pos_y(index, dancer_num)

        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            # This also sets the actual location by update handler
            ld_position.location = (0, init_y, 0)
            ld_position.rotation = (0, 0, 0)


def update_current_pos_by_index():
    """Update current position by index and set ld_position"""
    if not bpy.context:
        return
    index = state.current_pos_index

    if not state.pos_map_MODIFIED:
        _set_default_position()
        return

    pos_map_modified = state.pos_map_MODIFIED
    pos_id = state.pos_record[index]

    current_pos_map = pos_map.get(pos_id)
    is_earlier_than_first_frame = False

    if state.pos_map and bpy.context.scene.frame_current < state.pos_start_record[0]:
        is_earlier_than_first_frame = True

    if current_pos_map is None or is_earlier_than_first_frame:
        _set_default_position()
        return

    current_pos = current_pos_map.pos

    if index == len(state.pos_record) - 1:
        for dancer_name in state.dancer_names:
            dancer_pos = current_pos.get(dancer_name)

            obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                # If position is None, display 0,0,0,0,0,0
                if dancer_pos is None:
                    ld_position.location = (0.0, 0.0, 0.0)
                    ld_position.rotation = (0.0, 0.0, 0.0)
                else:
                    # This also sets the actual location by update handler
                    ld_position.location = (
                        dancer_pos.location.x,
                        dancer_pos.location.y,
                        dancer_pos.location.z,
                    )
                    ld_position.rotation = (
                        dancer_pos.rotation.rx,
                        dancer_pos.rotation.ry,
                        dancer_pos.rotation.rz,
                    )

    else:
        next_pos_id = state.pos_record[index + 1]
        next_pos_map = pos_map_modified.get(next_pos_id)
        if next_pos_map is None:
            return

        next_pos = next_pos_map.pos

        frame = bpy.context.scene.frame_current
        current_start = current_pos_map.start
        next_start = next_pos_map.start

        for dancer_name in state.dancer_names:
            dancer_pos = current_pos.get(dancer_name)
            next_dancer_pos = next_pos.get(dancer_name)

            obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                # If either current or next position is None, display 0,0,0,0,0,0
                if dancer_pos is None or next_dancer_pos is None:
                    ld_position.location = (0.0, 0.0, 0.0)
                    ld_position.rotation = (0.0, 0.0, 0.0)
                else:
                    ratio = (frame - current_start) / (next_start - current_start)
                    # This also sets the actual location by update handler
                    ld_position.location = (  # NOTE: Linear interpolation
                        dancer_pos.location.x
                        + (next_dancer_pos.location.x - dancer_pos.location.x) * ratio,
                        dancer_pos.location.y
                        + (next_dancer_pos.location.y - dancer_pos.location.y) * ratio,
                        dancer_pos.location.z
                        + (next_dancer_pos.location.z - dancer_pos.location.z) * ratio,
                    )
