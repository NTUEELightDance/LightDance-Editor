import bpy

from ....properties.types import PositionPropertyType
from ...models import Location, Position, Rotation
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


def _default_position(index):
    total = len(state.dancer_names)
    init_y = _init_pos_y(index, total)
    return Position(
        location=Location(0.0, init_y, 0.0), rotation=Rotation(0.0, 0.0, 0.0)
    )


def _set_default_position():
    dancer_num = len(state.dancer_names)
    for index, dancer_name in enumerate(state.dancer_names):
        init_y = _init_pos_y(index, dancer_num)

        obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
        if obj is not None:
            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            # This also sets the actual location by update handler
            ld_position.location = (0.0, init_y, 0.0)
            ld_position.rotation = (0.0, 0.0, 0.0)


def _set_from_object_transform(
    obj: bpy.types.Object, ld_position: PositionPropertyType
) -> None:
    """Fill ld_position using the object's evaluated transform (keyframe value at current frame)."""
    loc = tuple(obj.location)
    rot = tuple(obj.rotation_euler)
    ld_position.location = (loc[0], loc[1], loc[2])
    ld_position.rotation = (rot[0], rot[1], rot[2])
    ld_position.is_none = True


def _interpolate_dancer_position(
    dancer_name: str, frame: int, current_index: int
) -> tuple[tuple[float, float, float], tuple[float, float, float]] | None:
    """
    Reconstruct the pose Blender would show for a None slot by linearly
    interpolating the nearest frames that have concrete positions.
    """

    def _frame_at(idx: int):
        frame_id = state.pos_record[idx]
        return state.pos_map.get(frame_id) or state.pos_map.get(frame_id)

    prev_pos: tuple[int, Position] | None = None
    for idx in range(current_index, -1, -1):
        pos_frame = _frame_at(idx)
        if pos_frame is None:
            continue
        dancer_pos = pos_frame.pos.get(dancer_name)
        if dancer_pos is not None:
            prev_pos = (pos_frame.start, dancer_pos)
            break

    next_pos: tuple[int, Position] | None = None
    for idx in range(current_index + 1, len(state.pos_record)):
        pos_frame = _frame_at(idx)
        if pos_frame is None:
            continue
        dancer_pos = pos_frame.pos.get(dancer_name)
        if dancer_pos is not None:
            next_pos = (pos_frame.start, dancer_pos)
            break

    if prev_pos is None and next_pos is None:
        dancer_index = state.dancer_names.index(dancer_name)
        total = len(state.dancer_names)
        init_y = _init_pos_y(dancer_index, total)
        return ((0.0, init_y, 0.0), (0.0, 0.0, 0.0))

    if next_pos is None:
        _, dancer_pos = prev_pos  # type: ignore
        return (
            (dancer_pos.location.x, dancer_pos.location.y, dancer_pos.location.z),
            (dancer_pos.rotation.rx, dancer_pos.rotation.ry, dancer_pos.rotation.rz),
        )
    if prev_pos is None:
        # _, dancer_pos = next_pos
        # return (
        #     (dancer_pos.location.x, dancer_pos.location.y, dancer_pos.location.z),
        #     (dancer_pos.rotation.rx, dancer_pos.rotation.ry, dancer_pos.rotation.rz),
        # )
        prev_start = -1
        dancer_index = state.dancer_names.index(dancer_name)
        prev_dancer_pos = _default_position(dancer_index)

        prev_pos = prev_start, prev_dancer_pos

    prev_start, prev_dancer_pos = prev_pos
    next_start, next_dancer_pos = next_pos
    if next_start == prev_start:
        return (
            (
                prev_dancer_pos.location.x,
                prev_dancer_pos.location.y,
                prev_dancer_pos.location.z,
            ),
            (
                prev_dancer_pos.rotation.rx,
                prev_dancer_pos.rotation.ry,
                prev_dancer_pos.rotation.rz,
            ),
        )

    ratio = (frame - prev_start) / (next_start - prev_start)
    location = (
        prev_dancer_pos.location.x
        + (next_dancer_pos.location.x - prev_dancer_pos.location.x) * ratio,
        prev_dancer_pos.location.y
        + (next_dancer_pos.location.y - prev_dancer_pos.location.y) * ratio,
        prev_dancer_pos.location.z
        + (next_dancer_pos.location.z - prev_dancer_pos.location.z) * ratio,
    )
    rotation = (
        prev_dancer_pos.rotation.rx
        + (next_dancer_pos.rotation.rx - prev_dancer_pos.rotation.rx) * ratio,
        prev_dancer_pos.rotation.ry
        + (next_dancer_pos.rotation.ry - prev_dancer_pos.rotation.ry) * ratio,
        prev_dancer_pos.rotation.rz
        + (next_dancer_pos.rotation.rz - prev_dancer_pos.rotation.rz) * ratio,
    )
    return (location, rotation)


def update_current_pos_by_index():
    """Update current position by index and set ld_position"""
    if not bpy.context:
        return
    index = state.current_pos_index
    frame = bpy.context.scene.frame_current

    def _sync_all_dancers_from_blender():
        for dancer_name in state.dancer_names:
            obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
            if obj:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                _set_from_object_transform(obj, ld_position)

    if not state.pos_map:
        _sync_all_dancers_from_blender()
        return

    pos_map_modified = state.pos_map
    pos_id = state.pos_record[index]

    current_pos_map = pos_map_modified.get(pos_id)
    is_earlier_than_first_frame = False

    if state.pos_map and bpy.context.scene.frame_current < state.pos_start_record[0]:
        is_earlier_than_first_frame = True

    if is_earlier_than_first_frame:
        _set_default_position()

    if current_pos_map is None:
        return

    current_pos = current_pos_map.pos

    if index == len(state.pos_record) - 1:
        for dancer_name in state.dancer_names:
            dancer_pos = current_pos.get(dancer_name)

            obj: bpy.types.Object | None = bpy.data.objects.get(dancer_name)
            if obj is not None:
                ld_position: PositionPropertyType = getattr(obj, "ld_position")
                if dancer_pos is None:
                    interpolated = _interpolate_dancer_position(
                        dancer_name, frame, index
                    )
                    if interpolated is None:
                        _set_from_object_transform(obj, ld_position)
                    else:
                        loc, rot = interpolated
                        ld_position.location = loc
                        ld_position.rotation = rot
                        ld_position.is_none = True
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
                    ld_position.is_none = False

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
            if obj is None:
                continue

            ld_position: PositionPropertyType = getattr(obj, "ld_position")
            if dancer_pos is None:
                interpolated = _interpolate_dancer_position(dancer_name, frame, index)
                if interpolated is None:
                    _set_from_object_transform(obj, ld_position)
                else:
                    loc, rot = interpolated
                    ld_position.location = loc
                    ld_position.rotation = rot
                    ld_position.is_none = True
                continue

            if next_dancer_pos is None:
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
                ld_position.is_none = False
                continue

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
            ld_position.rotation = (
                dancer_pos.rotation.rx
                + (next_dancer_pos.rotation.rx - dancer_pos.rotation.rx) * ratio,
                dancer_pos.rotation.ry
                + (next_dancer_pos.rotation.ry - dancer_pos.rotation.ry) * ratio,
                dancer_pos.rotation.rz
                + (next_dancer_pos.rotation.rz - dancer_pos.rotation.rz) * ratio,
            )
            ld_position.is_none = False
