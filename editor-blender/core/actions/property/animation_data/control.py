from typing import Dict, List, Optional, Tuple, cast

import bpy

from .....properties.types import RevisionPropertyItemType, RevisionPropertyType
from ....models import ControlMapElement, DancerName, LEDData, MapID, PartName, PartType
from ....states import state
from ....utils.convert import rgba_to_float
from .utils import ensure_action, ensure_curve, get_keyframe_points

"""
setups & update colormap(===setups)
"""


def set_ctrl_keyframes_from_state(effect_only: bool = False):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    ctrl_map = state.control_map
    ctrl_frame_number = len(ctrl_map)

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table

    fade_seq: List[Tuple[int, bool]] = [(0, False)] * ctrl_frame_number

    prev_effect_ids: Dict[DancerName, Dict[PartName, List[int]]] = {}

    sorted_ctrl_map = sorted(ctrl_map.items(), key=lambda item: item[1].start)

    for i, (id, ctrl_map_element) in enumerate(sorted_ctrl_map):
        frame_start = ctrl_map_element.start
        ctrl_status = ctrl_map_element.status

        fade = ctrl_map_element.fade
        fade_seq[i] = frame_start, fade

        for dancer_name, ctrl in ctrl_status.items():
            dancer_index = state.dancer_part_index_map[dancer_name].index

            for part_name, part_data in ctrl.items():
                part_obj_name = f"{dancer_index}_{part_name}"

                prev_effect_id = prev_effect_ids.setdefault(dancer_name, {}).setdefault(
                    part_name, [-1]
                )

                if isinstance(part_data, LEDData):
                    part_parent = data_objects[part_obj_name]
                    part_alpha = part_data.alpha

                    if part_data.effect_id > 0:
                        part_effect = led_effect_table[part_data.effect_id].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in part_effect
                        ]

                        prev_effect_id[0] = part_data.effect_id

                    elif prev_effect_id[0] > 0:
                        prev_effect = led_effect_table[prev_effect_id[0]].effect
                        led_rgb_floats = [
                            rgba_to_float(color_map[led_data.color_id].rgb, part_alpha)
                            for led_data in prev_effect
                        ]

                    else:
                        led_rgb_floats = [(0, 0, 0)] * len(part_parent.children)

                    for led_obj in part_parent.children:
                        position: int = getattr(led_obj, "ld_led_pos")
                        led_rgb_float = led_rgb_floats[position]

                        action = ensure_action(
                            led_obj, f"{part_obj_name}Action.{position:03}"
                        )
                        curves = action.fcurves

                        for d in range(3):
                            curve = ensure_curve(
                                action,
                                "color",
                                index=d,
                                keyframe_points=ctrl_frame_number,
                                clear=i == 0,
                            )

                            _, kpoints_list = get_keyframe_points(curve)
                            point = kpoints_list[i]

                            point.co = frame_start, led_rgb_float[d]
                            point.interpolation = "LINEAR" if fade else "CONSTANT"

                else:
                    if effect_only:
                        continue

                    part_obj = data_objects[part_obj_name]

                    part_rgb = color_map[part_data.color_id].rgb
                    fiber_rgb_float = rgba_to_float(part_rgb, part_data.alpha)

                    action = ensure_action(part_obj, f"{part_obj_name}Action")
                    curves = action.fcurves

                    for d in range(3):
                        curve = ensure_curve(
                            action,
                            "color",
                            index=d,
                            keyframe_points=ctrl_frame_number,
                            clear=i == 0,
                        )

                        _, kpoints_list = get_keyframe_points(curve)
                        point = kpoints_list[i]

                        point.co = frame_start, fiber_rgb_float[d]
                        point.interpolation = "LINEAR" if fade else "CONSTANT"

        # insert fake frame
        scene = bpy.context.scene
        action = ensure_action(scene, "SceneAction")

        curve = ensure_curve(
            action, "ld_control_frame", keyframe_points=ctrl_frame_number, clear=i == 0
        )
        _, kpoints_list = get_keyframe_points(curve)

        point = kpoints_list[i]
        point.co = frame_start, frame_start
        point.interpolation = "CONSTANT"

        # set revision
        rev = ctrl_map_element.rev

        # curve = ensure_curve(
        #     action, "ld_control__meta", keyframe_points=ctrl_frame_number, clear=i == 0
        # )
        # _, kpoints_list = get_keyframe_points(curve)
        #
        # point = kpoints_list[i]
        # point.co = frame_start, rev.meta
        # point.interpolation = "CONSTANT"
        #
        # curve = ensure_curve(
        #     action, "ld_control_data", keyframe_points=ctrl_frame_number, clear=i == 0
        # )
        # _, kpoints_list = get_keyframe_points(curve)
        #
        # point = kpoints_list[i]
        # point.co = frame_start, rev.data
        # point.interpolation = "CONSTANT"

        ctrl_rev_item: RevisionPropertyItemType = getattr(
            bpy.context.scene, "ld_ctrl_rev"
        ).add()

        ctrl_rev_item.data = rev.data if rev else -1
        ctrl_rev_item.meta = rev.meta if rev else -1

        ctrl_rev_item.frame_id = id
        ctrl_rev_item.frame_start = frame_start

    curves = bpy.context.scene.animation_data.action.fcurves
    curve = curves.find("ld_control_frame")
    # curve.keyframe_points.sort()

    fade_seq.sort(key=lambda item: item[0])
    _, kpoints_list = get_keyframe_points(curve)

    for frame_start, fade in fade_seq:
        if fade:
            point_index = next(
                index
                for index, point in enumerate(kpoints_list)
                if point.co[0] == frame_start
            )

            if point_index == ctrl_frame_number - 1:
                continue

            point = kpoints_list[point_index]
            next_point = kpoints_list[point_index + 1]

            next_point.co = (next_point.co[0], point.co[1])


"""
update control keyframes
"""


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

    # insert fake frame
    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_control_frame")

    _, kpoints_list = get_keyframe_points(curve)
    point = curve.keyframe_points.insert(frame_start, frame_start)

    # update new ld_control_frame
    try:
        new_next_point = next(p for p in kpoints_list if p.co[0] > frame_start)
        new_next_fade_points = [
            point
            for point in kpoints_list
            if point.co[0] > frame_start and point.co[1] == new_next_point.co[1]
        ]

        if new_next_point.co[0] != new_next_point.co[1]:  # new co's previous point fade
            point.co = frame_start, new_next_point.co[1]
        else:
            point.co = frame_start, frame_start

        if fade:  # propagate fade to next points
            for new_p in new_next_fade_points:
                new_p.co = new_p.co[0], point.co[1]
        else:  # reset next point to frame_start
            for new_p in new_next_fade_points:
                new_p.co = new_p.co[0], new_next_point.co[0]

    except StopIteration:
        pass

    point.interpolation = "CONSTANT"
    curve.keyframe_points.sort()

    # insert rev frame (meta & data)
    rev = ctrl_element.rev

    # curve = curves.find("ld_ctrl_meta")
    # point = curve.keyframe_points.insert(frame_start, (rev.meta if rev else -1))
    # point.interpolation = "CONSTANT"
    #
    # curve = curves.find("ld_ctrl_data")
    # point = curve.keyframe_points.insert(frame_start, (rev.data if rev else -1))
    # point.interpolation = "CONSTANT"

    ctrl_rev: RevisionPropertyItemType = getattr(bpy.context.scene, "ld_ctrl_rev").add()

    ctrl_rev.data = rev.data if rev else -1
    ctrl_rev.meta = rev.meta if rev else -1

    ctrl_rev.frame_id = id
    ctrl_rev.frame_start = frame_start


def edit_single_ctrl_keyframe(
    ctrl_id: MapID, ctrl_element: ControlMapElement, only_meta: bool = False
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    color_map = state.color_map
    led_effect_table = state.led_effect_id_table

    old_ctrl_map = state.control_map  # control_map before update
    old_frame_start = old_ctrl_map[ctrl_id].start

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
        pass

    point.interpolation = "CONSTANT"
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


def delete_single_ctrl_keyframe(
    ctrl_id: MapID, incoming_frame_start: Optional[int] = None
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    old_ctrl_map = state.control_map  # only for checking dancer list
    old_frame_start = (
        incoming_frame_start if incoming_frame_start else old_ctrl_map[ctrl_id].start
    )
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
                        index: Optional[int] = None

                        for d in range(3):
                            curve = curves.find("color", index=d)
                            kpoints, kpoints_list = get_keyframe_points(curve)

                            if index is None:
                                index, point = next(
                                    (i, point)
                                    for i, point in enumerate(kpoints_list)
                                    if point.co[0] == old_frame_start
                                )
                            else:
                                point = kpoints_list[index]

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

    # TODO: delete rev

    ctrl_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_ctrl_rev")
    try:
        ctrl_rev_index = next(
            i for i, item in enumerate(ctrl_rev) if getattr(item, "frame_id") == ctrl_id
        )
        ctrl_rev.remove(ctrl_rev_index)  # type: ignore

    except StopIteration:
        pass
