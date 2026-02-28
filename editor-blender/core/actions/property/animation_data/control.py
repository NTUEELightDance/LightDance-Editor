"""
control.py

- This file contains functions to update control keyframes in Blender.
"""

from typing import cast

import bpy

from .....properties.types import RevisionPropertyItemType
from ....log import logger
from ....models import RGB, ControlMapElement, DancerName, MapID, PartName, PartType
from ....states import state
from ....utils.algorithms import (
    binary_search,
    expanded_filtered_map_bound,
    smallest_range_including_lr,
)
from ....utils.convert import (
    ControlAddCurveData,
    ControlDeleteCurveData,
    ControlModifyAnimationData,
    ControlUpdateCurveData,
    control_map_to_animation_data,
)
from ....utils.notification import notify
from .utils import ensure_action, ensure_curve, get_keyframe_points

# Insert a default keyframe here
default_keyframe_start = -1


def reset_control_frames_and_fade_sequence(fade_seq: list[tuple[int, bool]]):
    if not bpy.context:
        return
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")
    curve = ensure_curve(
        action, "ld_control_frame", keyframe_points=len(fade_seq), clear=True
    )

    # fade_seq contains only loaded frames
    _, kpoints_list = get_keyframe_points(curve)
    for i, (start, _) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        point.interpolation = "CONSTANT"
        point.select_control_point = False


def reset_ctrl_rev(sorted_ctrl_map: list[tuple[MapID, ControlMapElement]]):
    if not bpy.context:
        return
    getattr(bpy.context.scene, "ld_ctrl_rev").clear()
    for _, (id, ctrl_map_element) in enumerate(sorted_ctrl_map):
        frame_start = ctrl_map_element.start
        rev = ctrl_map_element.rev

        ctrl_rev_item: RevisionPropertyItemType = getattr(
            bpy.context.scene, "ld_ctrl_rev"
        ).add()

        ctrl_rev_item.data = rev.data if rev else -1
        ctrl_rev_item.meta = rev.meta if rev else -1

        ctrl_rev_item.frame_id = id
        ctrl_rev_item.frame_start = frame_start


def update_control_frames_and_fade_sequence(
    delete_frames: list[int],
    update_frames: list[tuple[int, int]],
    add_frames: list[int],
    fade_seq: list[tuple[int, bool]],
):
    if not bpy.context:
        return
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")

    curve = ensure_curve(action, "ld_control_frame")
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

    curve.keyframe_points.sort()

    # WARNING: This is a temporary fix for the fade sequence
    if len(fade_seq) != len(kpoints_list):
        curve = ensure_curve(
            action, "ld_control_frame", keyframe_points=len(fade_seq), clear=True
        )
        _, kpoints_list = get_keyframe_points(curve)

    # update fade sequence
    for i, (start, _) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        point.interpolation = "CONSTANT"
        point.select_control_point = False


"""
initiate control keyframes
"""


def init_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: list[tuple[int, bool, tuple[float, float, float]]],
):
    curves = [
        ensure_curve(action, "color", index=d, keyframe_points=len(frames), clear=True)
        for d in range(3)
    ]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    for i, (frame_start, fade, rgb_float) in enumerate(frames):
        for d in range(3):
            point = kpoints_lists[d][i]
            point.co = frame_start, rgb_float[d]

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False


def _filter_ctrl_map_by_loaded_range(
    sorted_ctrl_map: list[tuple[MapID, ControlMapElement]]
) -> tuple[list[int], list[tuple[MapID, ControlMapElement]], tuple[int, int],]:
    sorted_frame_ctrl_map = [item[1].start for item in sorted_ctrl_map]
    frame_range_l, frame_range_r = state.dancer_load_frames

    filtered_ctrl_map_start, filtered_ctrl_map_end = smallest_range_including_lr(
        sorted_frame_ctrl_map, frame_range_l, frame_range_r
    )
    filtered_ctrl_map = sorted_ctrl_map[
        filtered_ctrl_map_start : filtered_ctrl_map_end + 1
    ]

    not_loaded_ctrl_frames: list[MapID] = []
    filtered_index = 0
    for sorted_index in range(len(sorted_ctrl_map)):
        if filtered_index >= len(filtered_ctrl_map):
            not_loaded_ctrl_frames.append(sorted_ctrl_map[sorted_index][0])
        elif filtered_ctrl_map[filtered_index][0] != sorted_ctrl_map[sorted_index][0]:
            not_loaded_ctrl_frames.append(sorted_ctrl_map[sorted_index][0])
        else:
            filtered_index += 1

    init_indexs_r_closed = (
        filtered_ctrl_map_start,
        filtered_ctrl_map_end,
    )

    return not_loaded_ctrl_frames, filtered_ctrl_map, init_indexs_r_closed


def _init_control_part_action_keyframes(
    init_indexs_r_closed: tuple[int, int] | tuple[()],
    sorted_control_map: list[tuple[MapID, ControlMapElement]],
) -> dict[PartName, tuple[()] | tuple[int, int]]:
    frame_range_l, frame_range_r = state.dancer_load_frames
    init_index_l, init_index_r_closed = -1, -1
    if init_indexs_r_closed:
        (
            init_index_l,
            init_index_r_closed,
        ) = init_indexs_r_closed  # r is included in range

    part_dict = {}

    for dancer, parts in state.dancers.items():
        for part in parts:
            if not init_indexs_r_closed:
                part_dict[part] = ()
                continue

            part_dict[part] = expanded_filtered_map_bound(
                frame_range_l,
                frame_range_r,
                init_index_l,
                init_index_r_closed,
                sorted_control_map,
                dancer,
                part,
            )

    return part_dict


def init_ctrl_keyframes_from_state(dancers_reset: list[bool] | None = None):
    if not bpy.context:
        return
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    ctrl_map = state.control_map

    sorted_ctrl_map = sorted(ctrl_map.items(), key=lambda item: item[1].start)
    sorted_ctrl_start_map = [item[1].start for item in sorted_ctrl_map]
    frame_range_l, frame_range_r = state.dancer_load_frames

    filtered_ctrl_map = []
    init_indexs_r_closed = ()
    not_loaded_ctrl_frames = []
    if state.control_map:
        filtered_ctrl_map_start, filtered_ctrl_map_end = smallest_range_including_lr(
            sorted_ctrl_start_map, frame_range_l, frame_range_r
        )
        init_indexs_r_closed = filtered_ctrl_map_start, filtered_ctrl_map_end
        (
            not_loaded_ctrl_frames,
            filtered_ctrl_map,
            init_indexs_r_closed,
        ) = _filter_ctrl_map_by_loaded_range(sorted_ctrl_map)

    part_range_dict = _init_control_part_action_keyframes(
        init_indexs_r_closed, sorted_ctrl_map
    )
    # state.not_loaded_ctrl_frames: a list of ctrl map ID that is not loaded
    state.not_loaded_control_frames = not_loaded_ctrl_frames
    animation_data = control_map_to_animation_data(filtered_ctrl_map, part_range_dict)

    ctrl_frame_number = len(filtered_ctrl_map)

    show_dancer = state.show_dancers

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        if not show_dancer[dancer_index]:
            continue

        parts = dancer_item.parts

        for part in parts:
            part_name = part.name
            part_type = part.type

            part_obj_name = f"{dancer_index}_{part_name}"
            part_obj = data_objects[part_obj_name]

            if part_type == PartType.LED:
                for led_obj in part_obj.children:
                    if led_obj.animation_data is not None:
                        action = cast(
                            bpy.types.Action | None, led_obj.animation_data.action
                        )
                        if action != None:
                            bpy.data.actions.remove(action, do_unlink=True)

            else:
                if part_obj.animation_data is not None:
                    action = cast(
                        bpy.types.Action | None, part_obj.animation_data.action
                    )
                    if action != None:
                        bpy.data.actions.remove(action, do_unlink=True)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        # if ((dancers_reset is not None and not dancers_reset[dancer_index])
        #     or not show_dancer[dancer_index]
        # ):
        #     continue
        if ctrl_frame_number == 0:
            break
        if not show_dancer[dancer_index]:
            continue
        dancer_name = dancer_item.name
        parts = dancer_item.parts

        logger.info(f"[CTRL INIT] {dancer_name}")

        for part in parts:
            part_name = part.name
            part_type = part.type

            part_obj_name = f"{dancer_index}_{part_name}"
            part_obj = data_objects[part_obj_name]

            if not animation_data[dancer_name][part_name]:
                continue

            if part_type == PartType.LED:
                for led_obj in part_obj.children:
                    position: int = getattr(led_obj, "ld_led_pos")

                    action = ensure_action(
                        led_obj, f"{part_obj_name}Action.{position:03}"
                    )
                    frames = cast(
                        list[tuple[int, bool, tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )

                    default_frame = (default_keyframe_start, False, (0.0, 0.0, 0.0))
                    frames.insert(0, default_frame)

                    init_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    list[tuple[int, bool, tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )

                default_frame = (default_keyframe_start, False, (0.0, 0.0, 0.0))
                frames.insert(0, default_frame)

                init_ctrl_single_object_action(action, frames)

    reset_ctrl_rev(sorted_ctrl_map)

    # insert fake frame and update fade sequence
    scene = bpy.context.scene

    if scene.animation_data is not None:
        del_action = cast(bpy.types.Action | None, scene.animation_data.action)
        if del_action != None:
            bpy.data.actions.remove(del_action, do_unlink=True)

    if ctrl_frame_number == 0:
        return

    action = ensure_action(scene, "SceneAction")

    if dancers_reset is None or all(dancers_reset):
        fade_seq = [
            (frame.start, frame.fade_for_new_status) for _, frame in filtered_ctrl_map
        ]
        reset_control_frames_and_fade_sequence(fade_seq)


"""
modify control keyframes (adding, updating, and deleting all in one function)
"""


def modify_partial_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: tuple[
        ControlDeleteCurveData,
        ControlUpdateCurveData,
        ControlAddCurveData,
    ],
):
    delete = len(frames[0]) > 0
    update = len(frames[1]) > 0
    add = len(frames[2]) > 0

    curves = [ensure_curve(action, "color", index=d) for d in range(3)]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    kpoints_len = len(kpoints_lists[0])

    if delete:
        curve_index = 0

        for old_start in frames[0]:
            while (
                curve_index < kpoints_len
                and int(kpoints_lists[0][curve_index].co[0]) != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                for d in range(3):
                    point = kpoints_lists[d][curve_index]
                    curves[d].keyframe_points.remove(point)

    kpoints_len = len(kpoints_lists[0])

    update_reorder = False
    if update:
        curve_index = 0
        points_to_update: list[tuple[int, bpy.types.Keyframe, float, bool]] = []

        for old_start, frame_start, package in frames[1]:
            while (
                curve_index < kpoints_len
                and int(kpoints_lists[0][curve_index].co[0]) != old_start
            ):
                curve_index += 1

            original_status_is_not_None = curve_index < kpoints_len
            if original_status_is_not_None:
                if package is None:
                    # Have Status to No Status => Delete corresponding kpoint
                    for d in range(3):
                        point = kpoints_lists[d][curve_index]
                        curves[d].keyframe_points.remove(point)
                    kpoints_len -= 1
                    continue

                fade, rgb = package
                for d in range(3):
                    point = kpoints_lists[d][curve_index]
                    points_to_update.append((frame_start, point, rgb[d], fade))

                if old_start != frame_start and not (
                    kpoints_lists[0][max(0, curve_index - 1)].co[0] <= frame_start
                    and kpoints_lists[0][min(kpoints_len - 1, curve_index + 1)].co[0]
                    >= frame_start
                ):
                    update_reorder = True
            else:
                if package is None:
                    continue

                # No Status to Have Status => Add corresponding kpoint
                fade, rgb = package
                for d in range(3):
                    point = curves[d].keyframe_points.insert(frame_start, rgb[d])
                    point.interpolation = "LINEAR" if fade else "CONSTANT"
                    point.select_control_point = True

                if (
                    len(kpoints_lists[0]) >= 2
                    and kpoints_lists[0][-2].co[0] > frame_start
                ):
                    update_reorder = True

        for frame_start, point, value, fade in points_to_update:
            point.co = frame_start, value
            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False

    kpoints_len = len(kpoints_lists[0])

    # Add frames
    if add:
        for d, curve in enumerate(curves):
            # WARNING: Not sure which is faster
            # curves[d].keyframe_points.add(len(frames[2]))
            #
            # for i, (frame_start, fade, rgb_float) in enumerate(frames[2]):
            #     point = kpoints_lists[d][kpoints_len + i]
            #
            #     point.co = frame_start, rgb_float[d]
            #
            #     point.interpolation = "LINEAR" if fade else "CONSTANT"
            #     point.select_control_point = True
            for frame_start, package in frames[2]:
                if package is None:
                    continue
                fade, rgb_float = package
                point = curve.keyframe_points.insert(frame_start, rgb_float[d])

                point.interpolation = "LINEAR" if fade else "CONSTANT"
                point.select_control_point = True

    if add or update_reorder:
        for curve in curves:
            curve.keyframe_points.sort()


def _upsert_no_change_data(
    dancer_name: str,
    part_name: str,
    part_obj_name: str,
    action: bpy.types.Action,
    no_change_dict: dict[str, list[int]],
):
    curves = [ensure_curve(action, "color", index=d) for d in range(3)]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    kpoints_start_list = [point.co[0] for point in kpoints_lists[0]]
    no_change_starts = no_change_dict[part_obj_name]
    no_change_tuple_list = [
        (kpoints_start_list.index(start), start)
        for start in no_change_starts
        if start in kpoints_start_list
    ]
    for index, start in no_change_tuple_list:
        current_index = state.control_start_record.index(start)
        current_mapID = state.control_record[current_index]
        current_alpha = state.control_map[current_mapID].status[dancer_name][part_name].part_data.alpha  # type: ignore

        prev_index = index - 1
        prev_point = kpoints_lists[0][prev_index]
        prev_start = int(prev_point.co[0])
        prev_index = state.control_start_record.index(prev_start)
        prev_mapID = state.control_record[prev_index]

        prev_part_data = state.control_map[prev_mapID].status[dancer_name][part_name].part_data  # type: ignore
        prev_alpha = prev_part_data.alpha  # type: ignore
        ratio = 0
        if prev_alpha != 0:
            ratio = current_alpha / prev_alpha
        else:
            notify("WARNING", "Prev alpha should not be zero")

        for d in range(3):
            point = kpoints_lists[d][index]

            if index == 0:
                point.co[1] = 0
            else:
                prev_point = kpoints_lists[d][index - 1]
                point.co[1] = prev_point.co[1] * ratio


def modify_partial_ctrl_keyframes(
    animation_data: ControlModifyAnimationData,
    no_change_dict: dict[PartName, list[int]],
    dancers_reset: list[bool] | None = None,
):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    show_dancer_dict = dict(zip(state.dancer_names, state.show_dancers))

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        if dancers_reset is not None and dancers_reset[dancer_index]:
            continue

        dancer_name = dancer_item.name
        parts = dancer_item.parts

        if not show_dancer_dict[dancer_name]:
            continue

        logger.info(f"[CTRL MODIFY] {dancer_name}")

        for part in parts:
            part_name = part.name
            part_type = part.type

            part_obj_name = f"{dancer_index}_{part_name}"
            part_obj = data_objects[part_obj_name]

            if part_type == PartType.LED:
                for led_obj in part_obj.children:
                    position: int = getattr(led_obj, "ld_led_pos")
                    action = ensure_action(
                        led_obj, f"{part_obj_name}Action.{position:03}"
                    )

                    frames = cast(
                        tuple[
                            ControlDeleteCurveData,
                            ControlUpdateCurveData,
                            ControlAddCurveData,
                        ],
                        animation_data[dancer_name][part_name][position],
                    )
                    modify_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    tuple[
                        ControlDeleteCurveData,
                        ControlUpdateCurveData,
                        ControlAddCurveData,
                    ],
                    animation_data[dancer_name][part_name],
                )
                modify_partial_ctrl_single_object_action(action, frames)

    for part_obj_name in no_change_dict:
        part_obj = data_objects[part_obj_name]
        dancer_name = getattr(part_obj, "ld_dancer_name")
        part_name = getattr(part_obj, "ld_part_name")
        for led_obj in part_obj.children:
            position: int = getattr(led_obj, "ld_led_pos")
            action = ensure_action(led_obj, f"{part_obj_name}Action.{position:03}")
            _upsert_no_change_data(
                dancer_name, part_name, part_obj_name, action, no_change_dict
            )
