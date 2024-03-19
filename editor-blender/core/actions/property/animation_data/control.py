from typing import Dict, List, Optional, Tuple, cast

import bpy

from .....properties.types import RevisionPropertyItemType, RevisionPropertyType
from ....models import ControlMapElement, LEDData, MapID, PartType
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
    rgba_to_float,
)
from .utils import ensure_action, ensure_curve, get_keyframe_points


def reset_control_frames_and_fade_sequence(fade_seq: List[Tuple[int, bool]]):
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
        # point.handle_left_type = "FREE"
        # point.handle_right_type = "FREE"


def reset_ctrl_rev(sorted_ctrl_map: List[Tuple[MapID, ControlMapElement]]):
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
    delete_frames: List[int],
    update_frames: List[Tuple[int, int]],
    add_frames: List[int],
    fade_seq: List[Tuple[int, bool]],
):
    scene = bpy.context.scene
    action = ensure_action(scene, "SceneAction")

    curve = ensure_curve(action, "ld_control_frame")
    _, kpoints_list = get_keyframe_points(curve)

    # Delete frames
    kpoints_len = len(kpoints_list)
    curve_index = 0

    for old_start in delete_frames:
        while (
            curve_index < kpoints_len and kpoints_list[curve_index].co[0] != old_start
        ):
            curve_index += 1

        if curve_index < kpoints_len:
            point = kpoints_list[curve_index]
            curve.keyframe_points.remove(point)

    # Update frames
    kpoints_len = len(kpoints_list)
    curve_index = 0
    points_to_update: List[Tuple[int, bpy.types.Keyframe]] = []

    for old_start, frame_start in update_frames:
        while (
            curve_index < kpoints_len and kpoints_list[curve_index].co[0] != old_start
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

    # update fade sequence
    for i, (start, _) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        point.interpolation = "CONSTANT"
        point.select_control_point = False
        # point.handle_left_type = "FREE"
        # point.handle_right_type = "FREE"


"""
initiate control keyframes
"""


def init_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: List[Tuple[int, bool, Tuple[float, float, float]]],
    ctrl_frame_number: int,
):
    for d in range(3):
        curve = ensure_curve(
            action,
            "color",
            index=d,
            keyframe_points=ctrl_frame_number,
            clear=True,
        )

        _, kpoints_list = get_keyframe_points(curve)
        for i, (frame_start, fade, rgb_float) in enumerate(frames):
            point = kpoints_list[i]

            point.co = frame_start, rgb_float[d]

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False
            # point.handle_left_type = "FREE"
            # point.handle_right_type = "FREE"


def init_ctrl_keyframes_from_state(dancers_reset: Optional[List[bool]] = None):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

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
                        List[Tuple[int, bool, Tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    init_ctrl_single_object_action(action, frames, ctrl_frame_number)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    List[Tuple[int, bool, Tuple[float, float, float]]],
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
    frames: Tuple[
        ControlDeleteCurveData,
        ControlUpdateCurveData,
        ControlAddCurveData,
    ],
):
    for d in range(3):
        curve = ensure_curve(action, "color", index=d)
        _, kpoints_list = get_keyframe_points(curve)

        # Delete frames
        kpoints_len = len(kpoints_list)
        curve_index = 0

        for old_start in frames[0]:
            while (
                curve_index < kpoints_len
                and kpoints_list[curve_index].co[0] != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                point = kpoints_list[curve_index]
                curve.keyframe_points.remove(point)

        # Update frames
        kpoints_len = len(kpoints_list)
        curve_index = 0
        points_to_update: List[Tuple[int, bpy.types.Keyframe, float, bool]] = []

        for old_start, frame_start, fade, led_rgb_float in frames[1]:
            while (
                curve_index < kpoints_len
                and kpoints_list[curve_index].co[0] != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                point = kpoints_list[curve_index]
                points_to_update.append((frame_start, point, led_rgb_float[d], fade))

        for frame_start, point, led_rgb_float, fade in points_to_update:
            point.co = frame_start, led_rgb_float
            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False
            # point.handle_left_type = "FREE"
            # point.handle_right_type = "FREE"

        # Add frames
        kpoints_len = len(kpoints_list)
        curve.keyframe_points.add(len(frames[2]))

        for i, (frame_start, fade, rgb_float) in enumerate(frames[2]):
            point = kpoints_list[kpoints_len + i]

            point.co = frame_start, rgb_float[d]

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = True
            # point.handle_left_type = "FREE"
            # point.handle_right_type = "FREE"

        curve.keyframe_points.sort()


def modify_partial_ctrl_keyframes(
    animation_data: ControlModifyAnimationData,
    dancers_reset: Optional[List[bool]] = None,
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    for dancer_index, dancer_item in enumerate(state.dancers_array):
        if not dancers_reset is None and dancers_reset[dancer_index]:
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
                        Tuple[
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
                    Tuple[
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
    frames: List[Tuple[int, bool, Tuple[float, float, float]]],
):
    for d in range(3):
        curve = ensure_curve(action, "color", index=d)

        _, kpoints_list = get_keyframe_points(curve)
        kpoints_len = len(kpoints_list)

        curve.keyframe_points.add(len(frames))

        for i, (frame_start, fade, rgb_float) in enumerate(frames):
            point = kpoints_list[kpoints_len + i]

            point.co = frame_start, rgb_float[d]

            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = True
            # point.handle_left_type = "FREE"
            # point.handle_right_type = "FREE"

        curve.keyframe_points.sort()


def add_partial_ctrl_keyframes(animation_data: ControlAddAnimationData):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

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
                        List[Tuple[int, bool, Tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    add_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    List[Tuple[int, bool, Tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )
                add_partial_ctrl_single_object_action(action, frames)


def add_single_ctrl_keyframe(id: MapID, ctrl_element: ControlMapElement):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table

    ctrl_status = ctrl_element.status
    frame_start = ctrl_element.start
    fade = ctrl_element.fade

    inv_sorted_ctrl_map = sorted(
        state.control_map.items(), key=lambda item: -item[1].start
    )

    for dancer_name, ctrl in ctrl_status.items():
        dancer_index = state.dancer_part_index_map[dancer_name].index

        for part_name, part_data in ctrl.items():
            part_obj_name = f"{dancer_index}_{part_name}"

            if isinstance(part_data, LEDData):
                part_parent = data_objects[part_obj_name]

                if part_data.effect_id > 0:
                    part_effect = led_effect_table[part_data.effect_id].effect
                    led_rgb_floats = [
                        rgba_to_float(color_map[led_data.color_id].rgb, part_data.alpha)
                        for led_data in part_effect
                    ]

                else:
                    try:
                        prev_effect_frame = next(
                            frame
                            for _, frame in inv_sorted_ctrl_map
                            if frame.start < frame_start
                            and cast(
                                LEDData, frame.status[dancer_name][part_name]
                            ).effect_id
                            > 0
                        )
                        prev_effect_id = cast(
                            LEDData, prev_effect_frame.status[dancer_name][part_name]
                        ).effect_id

                        prev_effect = led_effect_table[prev_effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(
                                color_map[led_data.color_id].rgb, part_data.alpha
                            )
                            for led_data in prev_effect
                        ]

                    except StopIteration:
                        led_rgb_floats = [(0, 0, 0)] * len(part_parent.children)

                for led_obj in part_parent.children:
                    position: int = getattr(led_obj, "ld_led_pos")
                    led_rgb_float = led_rgb_floats[position]

                    curves = led_obj.animation_data.action.fcurves
                    for d in range(3):
                        point = curves.find("color", index=d).keyframe_points.insert(
                            frame_start, led_rgb_float[d]
                        )
                        point.interpolation = "LINEAR" if fade else "CONSTANT"
                        # point.handle_left_type = "FREE"
                        # point.handle_right_type = "FREE"

            else:
                part_obj = data_objects[part_obj_name]
                part_rgb = color_map[part_data.color_id].rgb
                part_rgba = rgba_to_float(part_rgb, part_data.alpha)

                action = ensure_action(part_obj, f"{part_obj_name}Action")
                curves = action.fcurves

                for d in range(3):
                    point = curves.find("color", index=d).keyframe_points.insert(
                        frame_start, part_rgba[d]
                    )
                    point.interpolation = "LINEAR" if fade else "CONSTANT"
                    # point.handle_left_type = "FREE"
                    # point.handle_right_type = "FREE"

    # insert fake frame
    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_control_frame")

    _, kpoints_list = get_keyframe_points(curve)
    point = curve.keyframe_points.insert(frame_start, frame_start)

    # update new ld_control_frame
    try:
        first_next_point = next(p for p in kpoints_list if p.co[0] > frame_start)
        next_points = [
            point
            for point in kpoints_list
            if point.co[0] > frame_start and point.co[1] == first_next_point.co[1]
        ]

        if (
            first_next_point.co[0] != first_next_point.co[1]
        ):  # new co's previous point fade
            point.co = frame_start, first_next_point.co[1]
        else:
            point.co = frame_start, frame_start

        if fade:  # propagate fade to next points
            for next_point in next_points:
                next_point.co = next_point.co[0], point.co[1]
        else:  # reset next point to frame_start
            for next_point in next_points:
                next_point.co = next_point.co[0], next_point.co[0]

    except StopIteration:
        old_last_frame = next(
            frame for _, frame in inv_sorted_ctrl_map if frame.start < frame_start
        )

        if old_last_frame.fade:
            point.co = frame_start, old_last_frame.start

    point.interpolation = "CONSTANT"
    # point.handle_left_type = "FREE"
    # point.handle_right_type = "FREE"
    curve.keyframe_points.sort()

    # insert rev frame (meta & data)
    rev = ctrl_element.rev

    ctrl_rev: RevisionPropertyItemType = getattr(bpy.context.scene, "ld_ctrl_rev").add()

    ctrl_rev.data = rev.data if rev else -1
    ctrl_rev.meta = rev.meta if rev else -1

    ctrl_rev.frame_id = id
    ctrl_rev.frame_start = frame_start


"""
update control keyframes
"""


def edit_partial_ctrl_single_object_action(
    action: bpy.types.Action,
    frames: List[Tuple[int, int, bool, Tuple[float, float, float]]],
):
    for d in range(3):
        curve = ensure_curve(action, "color", index=d)

        _, kpoints_list = get_keyframe_points(curve)
        kpoints_len = len(kpoints_list)
        points_to_update: List[Tuple[int, bpy.types.Keyframe, float, bool]] = []
        curve_index = 0

        for old_start, frame_start, fade, led_rgb_float in frames:
            while (
                curve_index < kpoints_len
                and kpoints_list[curve_index].co[0] != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                point = kpoints_list[curve_index]
                points_to_update.append((frame_start, point, led_rgb_float[d], fade))

        for frame_start, point, led_rgb_float, fade in points_to_update:
            point.co = frame_start, led_rgb_float
            point.interpolation = "LINEAR" if fade else "CONSTANT"
            point.select_control_point = False
            # point.handle_left_type = "FREE"
            # point.handle_right_type = "FREE"

        curve.keyframe_points.sort()


def edit_partial_ctrl_keyframes(animation_data: ControlUpdateAnimationData):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

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
                        List[Tuple[int, int, bool, Tuple[float, float, float]]],
                        animation_data[dancer_name][part_name][position],
                    )
                    edit_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    List[Tuple[int, int, bool, Tuple[float, float, float]]],
                    animation_data[dancer_name][part_name],
                )
                edit_partial_ctrl_single_object_action(action, frames)

    # getattr(bpy.context.scene, "ld_ctrl_rev").clear()
    # for id, ctrl_map_element in sorted_ctrl_map:
    #     frame_start = ctrl_map_element.start
    #     rev = ctrl_map_element.rev
    #
    #     ctrl_rev_item: RevisionPropertyItemType = getattr(
    #         bpy.context.scene, "ld_ctrl_rev"
    #     ).add()
    #
    #     ctrl_rev_item.data = rev.data if rev else -1
    #     ctrl_rev_item.meta = rev.meta if rev else -1
    #
    #     ctrl_rev_item.frame_id = id
    #     ctrl_rev_item.frame_start = frame_start


def edit_single_ctrl_keyframe(
    ctrl_id: MapID,
    ctrl_element: ControlMapElement,
    frame_start: Optional[int] = None,
    only_meta: bool = False,
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table

    if frame_start is None:
        old_ctrl_map = state.control_map  # control_map before update
        old_frame_start = old_ctrl_map[ctrl_id].start
    else:
        old_frame_start = frame_start

    new_frame_start = ctrl_element.start
    new_ctrl_status = ctrl_element.status
    new_fade = ctrl_element.fade

    old_inv_sorted_ctrl_map = sorted(
        state.control_map.items(), key=lambda item: -item[1].start
    )

    for dancer_name, ctrl in new_ctrl_status.items():
        dancer_index = state.dancer_part_index_map[dancer_name].index

        for part_name, part_data in ctrl.items():
            part_obj_name = f"{dancer_index}_{part_name}"
            part_alpha = part_data.alpha

            if isinstance(part_data, LEDData):
                part_parent = data_objects[part_obj_name]

                if part_data.effect_id > 0:
                    part_effect = led_effect_table[part_data.effect_id].effect
                    led_rgb_floats = [
                        rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                        for led_data in part_effect
                    ]

                else:
                    try:
                        prev_effect_frame = next(
                            frame
                            for _, frame in old_inv_sorted_ctrl_map
                            if frame.start < new_frame_start
                            and cast(
                                LEDData, frame.status[dancer_name][part_name]
                            ).effect_id
                            > 0
                        )
                        prev_effect_id = cast(
                            LEDData, prev_effect_frame.status[dancer_name][part_name]
                        ).effect_id

                        prev_effect = led_effect_table[prev_effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in prev_effect
                        ]

                    except StopIteration:
                        led_rgb_floats = [(0, 0, 0)] * len(part_parent.children)

                for led_obj in part_parent.children:
                    position: int = getattr(led_obj, "ld_led_pos")
                    led_rgb_float = led_rgb_floats[position]

                    curves = led_obj.animation_data.action.fcurves
                    for d in range(3):
                        curve = curves.find("color", index=d)
                        kpoints, kpoints_list = get_keyframe_points(curve)
                        point = next(
                            point
                            for point in kpoints_list
                            if point.co[0] == old_frame_start
                        )

                        point.co = new_frame_start, led_rgb_float[d]
                        point.interpolation = "LINEAR" if new_fade else "CONSTANT"
                        # point.handle_left_type = "FREE"
                        # point.handle_right_type = "FREE"

                        # TODO: Delete and insert instead of sorting
                        kpoints.sort()

            else:
                part_obj = data_objects[part_obj_name]
                part_rgb = color_map[part_data.color_id].rgb
                part_rgb_float = rgba_to_float(part_rgb, part_alpha)

                curves = part_obj.animation_data.action.fcurves
                for d in range(3):
                    curve = curves.find("color", index=d)
                    kpoints, kpoints_list = get_keyframe_points(curve)

                    point = next(
                        point
                        for point in kpoints_list
                        if point.co[0] == old_frame_start
                    )
                    point.co = new_frame_start, part_rgb_float[d]
                    point.interpolation = "LINEAR" if new_fade else "CONSTANT"
                    # point.handle_left_type = "FREE"
                    # point.handle_right_type = "FREE"

                    # TODO: Delete and insert instead of sorting
                    kpoints.sort()

    # update fake frame
    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_control_frame")

    kpoints, kpoints_list = get_keyframe_points(curve)
    point = next(point for point in kpoints_list if point.co[0] == old_frame_start)

    # update old ld_control_frame
    try:
        old_next_point = next(p for p in kpoints_list if p.co[0] > old_frame_start)
        old_next_fade_points = [
            point
            for point in kpoints_list
            if point.co[0] > old_frame_start and point.co[1] == old_next_point.co[1]
        ]

        if point.co[0] != point.co[1]:  # old co's previous point fade
            for old_p in old_next_fade_points:
                old_p.co = old_p.co[0], point.co[1]
        elif (
            old_next_point.co[0] != old_next_point.co[1]
        ):  # reset next point to frame_start
            for old_p in old_next_fade_points:
                old_p.co = old_p.co[0], old_next_point.co[0]

    except StopIteration:
        pass

    # update new ld_control_frame
    try:
        new_next_point = next(p for p in kpoints_list if p.co[0] > new_frame_start)
        new_next_fade_points = [
            point
            for point in kpoints_list
            if point.co[0] > new_frame_start and point.co[1] == new_next_point.co[1]
        ]

        if new_next_point.co[0] != new_next_point.co[1]:  # new co's previous point fade
            point.co = new_frame_start, new_next_point.co[1]
        else:
            point.co = new_frame_start, new_frame_start

        if new_fade:  # propagate fade to next points
            for new_p in new_next_fade_points:
                new_p.co = new_p.co[0], point.co[1]
        else:  # reset next point to frame_start
            for new_p in new_next_fade_points:
                new_p.co = new_p.co[0], new_next_point.co[0]

    except StopIteration:
        # No next point
        point.co = new_frame_start, new_frame_start

    point.interpolation = "CONSTANT"
    # point.handle_left_type = "FREE"
    # point.handle_right_type = "FREE"
    kpoints.sort()

    # update rev frame (meta & data)
    rev = ctrl_element.rev

    # TODO: update rev

    ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    try:
        ctrl_rev_item = next(
            item for item in ctrl_rev if getattr(item, "frame_id") == ctrl_id
        )

        ctrl_rev_item.data = rev.data if rev else -1
        ctrl_rev_item.meta = rev.meta if rev else -1

        ctrl_rev_item.frame_id = ctrl_id
        ctrl_rev_item.frame_start = new_frame_start

    except StopIteration:
        pass


"""
delete control keyframes
"""


def delete_partial_ctrl_single_object_action(
    action: bpy.types.Action, frames: List[int]
):
    for d in range(3):
        curve = ensure_curve(action, "color", index=d)

        _, kpoints_list = get_keyframe_points(curve)
        kpoints_len = len(kpoints_list)
        curve_index = 0

        for old_start in frames:
            while (
                curve_index < kpoints_len
                and kpoints_list[curve_index].co[0] != old_start
            ):
                curve_index += 1

            if curve_index < kpoints_len:
                point = kpoints_list[curve_index]
                curve.keyframe_points.remove(point)


def delete_partial_ctrl_keyframes(animation_data: ControlDeleteAnimationData):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

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
                        List[int],
                        animation_data[dancer_name][part_name][position],
                    )
                    delete_partial_ctrl_single_object_action(action, frames)

            else:
                action = ensure_action(part_obj, f"{part_obj_name}Action")

                frames = cast(
                    List[int],
                    animation_data[dancer_name][part_name],
                )
                delete_partial_ctrl_single_object_action(action, frames)


def delete_single_ctrl_keyframe(
    ctrl_id: MapID, incoming_frame_start: Optional[int] = None
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    if incoming_frame_start is None:
        old_ctrl_map = state.control_map  # only for checking dancer list
        old_frame_start = old_ctrl_map[ctrl_id].start
    else:
        old_frame_start = incoming_frame_start

    dancers_array = state.dancers_array

    for dancer_item in dancers_array:
        dancer_name = dancer_item.name
        dancer_parts = dancer_item.parts
        dancer_index = state.dancer_part_index_map[dancer_name].index

        for part_item in dancer_parts:
            part_name = part_item.name
            part_type = part_item.type
            part_obj_name = f"{dancer_index}_{part_name}"

            match part_type:
                case PartType.LED:
                    part_parent = data_objects[part_obj_name]

                    for led_obj in part_parent.children:
                        curves = led_obj.animation_data.action.fcurves
                        ctrl_rev_index: Optional[int] = None

                        for d in range(3):
                            curve = curves.find("color", index=d)
                            kpoints, kpoints_list = get_keyframe_points(curve)

                            if ctrl_rev_index is None:
                                ctrl_rev_index, point = next(
                                    (i, point)
                                    for i, point in enumerate(kpoints_list)
                                    if point.co[0] == old_frame_start
                                )
                            else:
                                point = kpoints_list[ctrl_rev_index]

                            kpoints.remove(point)

                case PartType.FIBER:
                    part_obj = data_objects[part_obj_name]

                    curves = part_obj.animation_data.action.fcurves
                    for d in range(3):
                        curve = curves.find("color", index=d)
                        kpoints, kpoints_list = get_keyframe_points(curve)

                        point = next(
                            point
                            for point in kpoints_list
                            if point.co[0] == old_frame_start
                        )
                        kpoints.remove(point)

    # delete fake frame
    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_control_frame")
    kpoints, kpoints_list = get_keyframe_points(curve)

    point = next(point for point in kpoints_list if point.co[0] == old_frame_start)

    # update old ld_control_frame
    try:
        old_next_point = next(p for p in kpoints_list if p.co[0] > old_frame_start)
        old_next_fade_points = [
            point
            for point in kpoints_list
            if point.co[0] > old_frame_start and point.co[1] == old_next_point.co[1]
        ]

        if point.co[0] != point.co[1]:  # old co's previous point fade
            for old_p in old_next_fade_points:
                old_p.co = old_p.co[0], point.co[1]
        elif (
            old_next_point.co[0] != old_next_point.co[1]
        ):  # reset next point to frame_start
            for old_p in old_next_fade_points:
                old_p.co = old_p.co[0], old_next_point.co[0]

    except StopIteration:
        pass

    kpoints.remove(point)

    ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    try:
        ctrl_rev_indexes = [
            i for i, item in enumerate(ctrl_rev) if getattr(item, "frame_id") == ctrl_id
        ]
        for ctrl_rev_index in ctrl_rev_indexes:
            ctrl_rev.remove(ctrl_rev_index)  # type: ignore

    except StopIteration:
        pass
