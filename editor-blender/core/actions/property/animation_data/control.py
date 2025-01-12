"""
control.py

- This file contains functions to update control keyframes in Blender.
"""

from typing import cast

import bpy

from .....properties.types import RevisionPropertyItemType
from ....models import ControlMapElement, MapID, PartType
from ....states import state
from ....utils.convert import (
    ControlAddAnimationData,
    ControlAddCurveData,
    ControlDeleteAnimationData,
    ControlDeleteCurveData,
    ControlModifyAnimationData,
    ControlUpdateAnimationData,
    ControlUpdateCurveData,
    control_map_to_animation_data,
)
from .utils import ensure_action, ensure_curve, get_keyframe_points


def reset_control_frames_and_fade_sequence(fade_seq: list[tuple[int, bool]]):
    if not bpy.context:
        return
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")
    curve = ensure_curve(
        action, "ld_control_frame", keyframe_points=len(fade_seq), clear=True
    )

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
    ctrl_frame_number: int,
):
    curves = [
        ensure_curve(
            action, "color", index=d, keyframe_points=ctrl_frame_number, clear=True
        )
        for d in range(3)
    ]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    for i, (frame_start, fade, rgb_float) in enumerate(frames):
        for d in range(3):
            point = kpoints_lists[d][i]
            point.co = frame_start, rgb_float[d]

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False


def init_ctrl_keyframes_from_state(dancers_reset: list[bool] | None = None):
    if not bpy.context:
        return
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    ctrl_map = state.control_map
    ctrl_frame_number = len(ctrl_map)

    sorted_ctrl_map = sorted(ctrl_map.items(), key=lambda item: item[1].start)
    animation_data = control_map_to_animation_data(sorted_ctrl_map)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        if dancers_reset is not None and not dancers_reset[dancer_index]:
            continue

        dancer_name = dancer_item.name
        parts = dancer_item.parts

        print("[CTRL INIT]", dancer_name)

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
                        list[tuple[int, bool, tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    init_ctrl_single_object_action(action, frames, ctrl_frame_number)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    list[tuple[int, bool, tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )
                init_ctrl_single_object_action(action, frames, ctrl_frame_number)

    reset_ctrl_rev(sorted_ctrl_map)

    # insert fake frame and update fade sequence
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")

    if dancers_reset is None or all(dancers_reset):
        fade_seq = [(frame.start, frame.fade) for _, frame in sorted_ctrl_map]
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

        for old_start, frame_start, fade, rgb in frames[1]:
            while (
                curve_index < kpoints_len
                and int(kpoints_lists[0][curve_index].co[0]) != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                for d in range(3):
                    point = kpoints_lists[d][curve_index]
                    points_to_update.append((frame_start, point, rgb[d], fade))

                if old_start != frame_start and not (
                    kpoints_lists[0][max(0, curve_index - 1)].co[0] <= frame_start
                    and kpoints_lists[0][min(kpoints_len - 1, curve_index + 1)].co[0]
                    >= frame_start
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
            for frame_start, fade, rgb_float in frames[2]:
                point = curve.keyframe_points.insert(frame_start, rgb_float[d])

                point.interpolation = "LINEAR" if fade else "CONSTANT"
                point.select_control_point = True

    if update_reorder:
        for curve in curves:
            curve.keyframe_points.sort()


def modify_partial_ctrl_keyframes(
    animation_data: ControlModifyAnimationData,
    dancers_reset: list[bool] | None = None,
):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        if dancers_reset is not None and dancers_reset[dancer_index]:
            continue

        dancer_name = dancer_item.name
        parts = dancer_item.parts

        print("[CTRL MODIFY]", dancer_name)

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


"""
add control keyframes
"""


def add_partial_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: list[tuple[int, bool, tuple[float, float, float]]],
):
    curves = [ensure_curve(action, "color", index=d) for d in range(3)]
    # kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    for d, curve in enumerate(curves):
        # WARNING: Not sure which is faster
        # kpoints_len = len(kpoints_lists[d])
        # curve.keyframe_points.add(len(frames))
        #
        # for i, (frame_start, fade, rgb_float) in enumerate(frames):
        #     point = kpoints_lists[d][kpoints_len + i]
        #     point.co = frame_start, rgb_float[d]
        #
        #     point.interpolation = "LINEAR" if fade else "CONSTANT"
        #     point.select_control_point = True
        #
        # curve.keyframe_points.sort()
        for frame_start, fade, rgb_float in frames:
            point = curve.keyframe_points.insert(frame_start, rgb_float[d])

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = True


def add_partial_ctrl_keyframes(animation_data: ControlAddAnimationData):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        dancer_name = dancer_item.name
        parts = dancer_item.parts

        print("[CTRL ADD]", dancer_name)

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
                        list[tuple[int, bool, tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    add_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    list[tuple[int, bool, tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )
                add_partial_ctrl_single_object_action(action, frames)


"""
update control keyframes
"""


def edit_partial_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: list[tuple[int, int, bool, tuple[float, float, float]]],
):
    curves = [ensure_curve(action, "color", index=d) for d in range(3)]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    update_reorder = False
    kpoints_len = len(kpoints_lists[0])
    points_to_update: list[tuple[int, bpy.types.Keyframe, float, bool]] = []
    curve_index = 0

    for old_start, frame_start, fade, led_rgb_float in frames:
        while (
            curve_index < kpoints_len
            and int(kpoints_lists[0][curve_index].co[0]) != old_start
        ):
            curve_index += 1

        if curve_index < kpoints_len:
            for d, (curve, kpoints_list) in enumerate(zip(curves, kpoints_lists)):
                point = kpoints_list[curve_index]
                points_to_update.append((frame_start, point, led_rgb_float[d], fade))

            if old_start != frame_start and not (
                kpoints_lists[0][max(0, curve_index - 1)].co[0] <= frame_start
                and kpoints_lists[0][min(kpoints_len - 1, curve_index + 1)].co[0]
                >= frame_start
            ):
                update_reorder = True

    for frame_start, point, led_rgb_float, fade in points_to_update:
        point.co = frame_start, led_rgb_float
        point.interpolation = "LINEAR" if fade else "CONSTANT"
        point.select_control_point = False

    if update_reorder:
        for curve in curves:
            curve.keyframe_points.sort()


def edit_partial_ctrl_keyframes(animation_data: ControlUpdateAnimationData):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        dancer_name = dancer_item.name
        parts = dancer_item.parts

        print("[CTRL UPDATE]", dancer_name)

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
                        list[tuple[int, int, bool, tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    edit_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    list[tuple[int, int, bool, tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )
                edit_partial_ctrl_single_object_action(action, frames)


"""
delete control keyframes
"""


def delete_partial_ctrl_single_object_action(
    action: bpy.types.Action, frames: list[int]
):
    curves = [ensure_curve(action, "color", index=d) for d in range(3)]
    kpoints_lists = [get_keyframe_points(curve)[1] for curve in curves]

    kpoints_len = len(kpoints_lists[0])
    curve_index = 0

    for old_start in frames:
        while (
            curve_index < kpoints_len
            and int(kpoints_lists[0][curve_index].co[0]) != old_start
        ):
            curve_index += 1

        if curve_index < kpoints_len:
            for curve, kpoints_list in zip(curves, kpoints_lists):
                point = kpoints_list[curve_index]
                curve.keyframe_points.remove(point)


def delete_partial_ctrl_keyframes(animation_data: ControlDeleteAnimationData):
    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        dancer_name = dancer_item.name
        parts = dancer_item.parts

        print("[CTRL DELETE]", dancer_name)

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
                        list[int],
                        animation_data[dancer_name][part_name][position],
                    )
                    delete_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    list[int],
                    animation_data[dancer_name][part_name],
                )
                delete_partial_ctrl_single_object_action(action, frames)
