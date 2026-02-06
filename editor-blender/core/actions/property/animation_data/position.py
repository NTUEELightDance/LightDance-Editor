"""
position.py

- This file contains functions to update position keyframes in Blender.
"""

from typing import cast

import bpy

from .....core.actions.state.dopesheet import register_handle_timeline
from .....core.utils.for_dev_only.test_keyframe import renew_pos_test_frame
from .....core.utils.for_dev_only.tmp_format_conv import sync_new_pos_map_from_old
from .....properties.types import RevisionPropertyItemType
from ....models import MapID, Position, PosMap, PosMapElement
from ....states import state
from ....utils.algorithms import (
    expanded_filtered_map_bound,
    smallest_range_including_lr,
)
from ....utils.convert import PosModifyAnimationData
from .utils import (
    ensure_action,
    ensure_curve,
    ensure_or_expand_curve,
    get_keyframe_points,
)

# if state.pos_map is empty, insert a default keyframe here
default_keyframe_start = -1


def _init_pos_y(index: float, total: float):
    if total == 1:
        return 0.0

    total_length = total - 1.0
    half_length = total_length / 2.0
    left_point = -half_length
    right_point = half_length

    x = (left_point * (total_length - index) + right_point * index) / total_length
    return x


def _set_default_keyframes():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_name in enumerate(state.dancer_names):
        total_num_of_dancer = len(state.dancer_names)
        init_y = _init_pos_y(dancer_index, total_num_of_dancer)
        if not state.show_dancers[dancer_index]:
            continue

        dancer_location = (0, init_y, 0)
        dancer_rotation = (0, 0, 0)
        dancer_obj = data_objects[dancer_name]
        action = ensure_action(dancer_obj, dancer_name + "Action")

        for d in range(3):
            loc_curve = ensure_curve(
                action,
                "location",
                index=d,
                keyframe_points=1,
                clear=True,
            )
            rot_curve = ensure_curve(
                action,
                "rotation_euler",
                index=d,
                keyframe_points=1,
                clear=True,
            )

            _, loc_kpoints_list = get_keyframe_points(loc_curve)
            _, rot_kpoints_list = get_keyframe_points(rot_curve)

            loc_point = loc_kpoints_list[0]
            rot_point = rot_kpoints_list[0]
            loc_point.co = default_keyframe_start, dancer_location[d]
            rot_point.co = default_keyframe_start, dancer_rotation[d]

            loc_point.interpolation = "LINEAR"
            rot_point.interpolation = "LINEAR"

            loc_point.select_control_point = False
            rot_point.select_control_point = False


def _clear_default_keyframes():
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_name in enumerate(state.dancer_names):
        if not state.show_dancers[dancer_index]:
            continue
        dancer_obj = data_objects[dancer_name]
        action = ensure_action(dancer_obj, dancer_name + "Action")

        for d in range(3):
            ensure_curve(
                action,
                "location",
                index=d,
                keyframe_points=0,
                clear=True,
            )
            ensure_curve(
                action,
                "rotation_euler",
                index=d,
                keyframe_points=0,
                clear=True,
            )


def reset_pos_frames():
    if not bpy.context:
        return

    pos_start_record_to_load = []
    for index in range(len(state.pos_record)):
        if state.pos_record[index] not in state.not_loaded_pos_frames:
            pos_start_record_to_load.append(state.pos_start_record[index])

    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")
    curve = ensure_curve(
        action,
        "ld_pos_frame",
        keyframe_points=len(pos_start_record_to_load),
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)
    for i, start in enumerate(pos_start_record_to_load):
        point = kpoints_list[i]
        point.co = start, start

        point.interpolation = "LINEAR"
        point.select_control_point = False

    # renew_pos_test_frame()


def reset_pos_rev(sorted_pos_map: list[tuple[MapID, PosMapElement]]):
    if not bpy.context:
        return
    getattr(bpy.context.scene, "ld_pos_rev").clear()
    for _, (id, pos_map_element) in enumerate(sorted_pos_map):
        frame_start = pos_map_element.start
        rev = pos_map_element.rev

        pos_rev_item: RevisionPropertyItemType = getattr(
            bpy.context.scene, "ld_pos_rev"
        ).add()

        pos_rev_item.data = rev.data if rev else -1
        pos_rev_item.meta = rev.meta if rev else -1

        pos_rev_item.frame_id = id
        pos_rev_item.frame_start = frame_start


def update_pos_frames(
    delete_frames: list[int],
    update_frames: list[tuple[int, int]],
    add_frames: list[int],
):
    if not bpy.context:
        return
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")

    curve = ensure_curve(action, "ld_pos_frame")
    _, kpoints_list = get_keyframe_points(curve)

    # Delete frames
    kpoints_len = len(kpoints_list)
    curve_index = 0

    for old_start in delete_frames:
        while (
            curve_index < kpoints_len
            and int(kpoints_list[curve_index].co[0]) != old_start
        ):
            curve_index += 1

        if curve_index < kpoints_len:
            point = kpoints_list[curve_index]
            curve.keyframe_points.remove(point)

    # Update frames
    kpoints_len = len(kpoints_list)
    curve_index = 0
    points_to_update: list[tuple[int, bpy.types.Keyframe]] = []

    for old_start, frame_start in update_frames:
        while (
            curve_index < kpoints_len
            and int(kpoints_list[curve_index].co[0]) != old_start
        ):
            curve_index += 1

        if curve_index < kpoints_len:
            point = kpoints_list[curve_index]
            points_to_update.append((frame_start, point))

    for frame_start, point in points_to_update:
        point.co = frame_start, frame_start

    # Add frames
    kpoints_len = len(kpoints_list)
    curve.keyframe_points.add(len(add_frames))

    for i, frame_start in enumerate(add_frames):
        point = kpoints_list[kpoints_len + i]
        point.co = frame_start, frame_start
        point.interpolation = "LINEAR"
        point.select_control_point = False

    curve.keyframe_points.sort()

    renew_pos_test_frame()


"""
setups & update colormap(===setups)
"""


def _init_pos_dancer_action_keyframes(
    init_indexs_r_closed: tuple[int, int] | tuple[()],
    sorted_pos_map: list[tuple[MapID, PosMapElement]],
) -> dict[str, tuple[()] | tuple[int, int]]:
    frame_range_l, frame_range_r = state.dancer_load_frames
    init_index_l, init_index_r_closed = -1, -1
    if init_indexs_r_closed:
        (
            init_index_l,
            init_index_r_closed,
        ) = init_indexs_r_closed  # r is included in range

    dancer_dict = {}
    for dancer in state.dancer_names:
        if not init_indexs_r_closed:
            dancer_dict[dancer] = ()
            continue

        dancer_dict[dancer] = expanded_filtered_map_bound(
            frame_range_l,
            frame_range_r,
            init_index_l,
            init_index_r_closed,
            sorted_pos_map,
            dancer,
        )
    return dancer_dict


def init_pos_keyframes_from_state(dancers_reset: list[bool] | None = None):
    if not bpy.context:
        return
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    pos_map_modified = state.pos_map_MODIFIED

    sorted_pos_map = sorted(pos_map_modified.items(), key=lambda item: item[1].start)

    sorted_frame_pos_map = [item[1].start for item in sorted_pos_map]
    frame_range_l, frame_range_r = state.dancer_load_frames

    filtered_pos_map = []
    init_indexs_r_closed = ()
    if state.pos_map_MODIFIED:
        filtered_pos_map_start, filtered_pos_map_end = smallest_range_including_lr(
            sorted_frame_pos_map, frame_range_l, frame_range_r
        )
        filtered_pos_map = sorted_pos_map[
            filtered_pos_map_start : filtered_pos_map_end + 1
        ]
        init_indexs_r_closed = (
            filtered_pos_map_start,
            filtered_pos_map_end,
        )  # end is included in the range

    # state.not_loaded_pos_frames: a list of pos map ID that is not loaded
    not_loaded_pos_frames: list[MapID] = []
    filtered_index = 0
    for sorted_index in range(len(sorted_pos_map)):
        if filtered_index >= len(filtered_pos_map):
            not_loaded_pos_frames.append(sorted_pos_map[sorted_index][0])
        elif filtered_pos_map[filtered_index][0] != sorted_pos_map[sorted_index][0]:
            not_loaded_pos_frames.append(sorted_pos_map[sorted_index][0])
        else:
            filtered_index += 1
    state.not_loaded_pos_frames = not_loaded_pos_frames

    pos_frame_number = len(filtered_pos_map)
    show_dancer = state.show_dancers

    for dancer_name in state.dancer_names:
        dancer_index = state.dancer_part_index_map[dancer_name].index
        if not show_dancer[dancer_index]:
            continue

        dancer_obj = data_objects[dancer_name]

        if dancer_obj.animation_data is not None:
            action = cast(bpy.types.Action | None, dancer_obj.animation_data.action)
            if action != None:
                bpy.data.actions.remove(action, do_unlink=True)

    # _set_default_keyframes()

    # Handle empty pos_map
    if not pos_map_modified:
        _set_default_keyframes()

        # Delete all fake frame
        scene = bpy.context.scene
        action = ensure_action(scene, "SceneAction")
        curve = ensure_curve(action, "ld_pos_frame", keyframe_points=0, clear=True)

        # FIXME delete this after, only for test
        renew_pos_test_frame()

        return

    dancer_range_dict = _init_pos_dancer_action_keyframes(
        init_indexs_r_closed, sorted_pos_map
    )
    # has_cleared_dict = {}
    # for dancer_name in state.dancer_names:
    #     has_cleared_dict[dancer_name] = False

    getattr(bpy.context.scene, "ld_pos_rev").clear()

    for i, (id, pos_map_element) in enumerate(sorted_pos_map):
        frame_start = pos_map_element.start
        pos_status = pos_map_element.pos

        for dancer_name, pos in pos_status.items():
            dancer_index = state.dancer_part_index_map[dancer_name].index
            dancer_shown_indexs_dict = dancer_range_dict[dancer_name]

            if (
                not show_dancer[dancer_index]
                or not dancer_shown_indexs_dict
                or pos is None
            ):
                continue

            dancer_l, dancer_r = dancer_shown_indexs_dict
            if not (dancer_l <= i and i <= dancer_r):
                continue

            pos = cast(Position, pos)
            dancer_location = (pos.location.x, pos.location.y, pos.location.z)
            dancer_rotation = (pos.rotation.rx, pos.rotation.ry, pos.rotation.rz)

            dancer_obj = data_objects[dancer_name]

            action = ensure_action(dancer_obj, dancer_name + "Action")
            # is_cleared = has_cleared_dict[dancer_name]
            for d in range(3):
                loc_curve = ensure_or_expand_curve(
                    action,
                    "location",
                    index=d,
                    clear=False,
                )
                rot_curve = ensure_or_expand_curve(
                    action,
                    "rotation_euler",
                    index=d,
                    clear=False,
                )

                _, loc_kpoints_list = get_keyframe_points(loc_curve)
                _, rot_kpoints_list = get_keyframe_points(rot_curve)

                loc_point = loc_kpoints_list[-1]
                rot_point = rot_kpoints_list[-1]
                loc_point.co = frame_start, dancer_location[d]
                rot_point.co = frame_start, dancer_rotation[d]

                loc_point.interpolation = "LINEAR"
                rot_point.interpolation = "LINEAR"

                loc_point.select_control_point = False
                rot_point.select_control_point = False

            # has_cleared_dict[dancer_name] = True

    for i, (id, pos_map_element) in enumerate(filtered_pos_map):
        frame_start = pos_map_element.start

        # insert fake frame
        scene = bpy.context.scene

        action = ensure_action(scene, "SceneAction")
        curve = ensure_curve(
            action, "ld_pos_frame", keyframe_points=pos_frame_number, clear=i == 0
        )
        _, kpoints_list = get_keyframe_points(curve)

        point = kpoints_list[i]
        point.co = frame_start, frame_start
        point.interpolation = "CONSTANT"

        point.select_control_point = False

        # set revision
        rev = pos_map_element.rev

        pos_rev_item: RevisionPropertyItemType = getattr(
            bpy.context.scene, "ld_pos_rev"
        ).add()

        pos_rev_item.data = rev.data if rev else -1
        pos_rev_item.meta = rev.meta if rev else -1

        pos_rev_item.frame_id = id
        pos_rev_item.frame_start = frame_start

    # FIXME delete this after, only for test
    renew_pos_test_frame()


"""
update position keyframes
"""


def modify_partial_pos_keyframes(modify_animation_data: PosModifyAnimationData):
    """
    Modify the position keyframes in Blender based on the given data.
    NOTE: Only one of the three arrays (delete / update / add) will be non-empty at a time.
    """
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))
    for dancer_item in state.dancers_array:
        dancer_name = dancer_item.name
        if not show_dancer_dict[dancer_name]:
            continue

        dancer_obj = data_objects[dancer_name]
        frames = modify_animation_data[dancer_name]

        delete = len(frames[0]) > 0
        update = len(frames[1]) > 0
        add = len(frames[2]) > 0

        action = ensure_action(dancer_obj, dancer_name + "Action")

        loc_curves = [ensure_curve(action, "location", index=d) for d in range(3)]
        rot_curves = [ensure_curve(action, "rotation_euler", index=d) for d in range(3)]
        loc_kpoints_lists = [get_keyframe_points(curve)[1] for curve in loc_curves]
        rot_kpoints_lists = [get_keyframe_points(curve)[1] for curve in rot_curves]

        kpoints_len = len(loc_kpoints_lists[0])

        # If exist default keyframe(Pos keyframe is originally empty), clear default keyframe
        if kpoints_len == 1 and loc_kpoints_lists[0][0].co[0] == default_keyframe_start:
            _clear_default_keyframes()
            loc_kpoints_lists = [get_keyframe_points(curve)[1] for curve in loc_curves]
            rot_kpoints_lists = [get_keyframe_points(curve)[1] for curve in rot_curves]

        kpoints_len = len(loc_kpoints_lists[0])

        if delete:
            curve_index = 0

            for old_start in frames[0]:
                while (
                    curve_index < kpoints_len
                    and int(loc_kpoints_lists[0][curve_index].co[0]) != old_start
                ):
                    curve_index += 1

                if curve_index < kpoints_len:
                    for d in range(3):
                        loc_point = loc_kpoints_lists[d][curve_index]
                        rot_point = rot_kpoints_lists[d][curve_index]
                        loc_curves[d].keyframe_points.remove(loc_point)
                        rot_curves[d].keyframe_points.remove(rot_point)

        kpoints_len = len(loc_kpoints_lists[0])

        update_reorder = False
        if update:
            curve_index = 0
            points_to_update: list[tuple[int, bpy.types.Keyframe, float]] = []
            frames_to_delete: list[int] = []

            for old_start, frame_start, bundle in frames[1]:
                if old_start != frame_start:
                    update_reorder = True

                while (
                    curve_index < kpoints_len
                    and int(loc_kpoints_lists[0][curve_index].co[0]) != old_start
                ):
                    curve_index += 1

                if curve_index < kpoints_len:
                    if bundle is None:
                        frames_to_delete.append(old_start)
                    else:
                        loc, rot = bundle
                        for d in range(3):
                            loc_point = loc_kpoints_lists[d][curve_index]
                            rot_point = rot_kpoints_lists[d][curve_index]
                            points_to_update.append((frame_start, loc_point, loc[d]))
                            points_to_update.append((frame_start, rot_point, rot[d]))

            for frame_start, kpoint, co in points_to_update:
                kpoint.co = frame_start, co
                kpoint.interpolation = "LINEAR"
                kpoint.select_control_point = False

            # Delete frames where all dancers are None
            if frames_to_delete:
                curve_index = 0
                for old_start in frames_to_delete:
                    while (
                        curve_index < len(loc_kpoints_lists[0])
                        and int(loc_kpoints_lists[0][curve_index].co[0]) != old_start
                    ):
                        curve_index += 1

                    if curve_index < len(loc_kpoints_lists[0]):
                        for d in range(3):
                            loc_point = loc_kpoints_lists[d][curve_index]
                            rot_point = rot_kpoints_lists[d][curve_index]
                            loc_curves[d].keyframe_points.remove(loc_point)
                            rot_curves[d].keyframe_points.remove(rot_point)

        kpoints_len = len(loc_kpoints_lists[0])

        # Add frames
        if add:
            for d in range(3):
                loc_curves[d].keyframe_points.add(len(frames[2]))
                rot_curves[d].keyframe_points.add(len(frames[2]))

                for i, (frame_start, (loc, rot)) in enumerate(frames[2]):
                    loc_point = loc_kpoints_lists[d][kpoints_len + i]
                    rot_point = rot_kpoints_lists[d][kpoints_len + i]

                    loc_point.co = frame_start, loc[d]
                    rot_point.co = frame_start, rot[d]
                    loc_point.interpolation = "LINEAR"
                    rot_point.interpolation = "LINEAR"
                    loc_point.select_control_point = True
                    rot_point.select_control_point = True

        if update_reorder or add:
            for curve in loc_curves:
                curve.keyframe_points.sort()
            for curve in rot_curves:
                curve.keyframe_points.sort()
