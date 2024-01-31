from typing import List, Tuple

import bpy

from ...models import ControlMapElement, FiberData, LEDData, MapID, PosMapElement
from ...states import state

"""
setups & update colormap(===setups)
"""


def set_ctrl_keyframes_from_state():
    ctrl_map = state.control_map
    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    ctrl_frame_number = len(ctrl_map)
    fade_seq: List[Tuple[int, bool]] = [(0, False)] * ctrl_frame_number
    for i, (_, ctrl_map_element) in enumerate(ctrl_map.items()):
        frame_start = ctrl_map_element.start
        fade = ctrl_map_element.fade
        ctrl_status = ctrl_map_element.status
        fade_seq[i] = frame_start, fade
        for dancer_name, ctrl in ctrl_status.items():
            dancer_index = dancer_name.split("_")[0]
            for part_name, part_data in ctrl.items():
                if isinstance(part_data, LEDData):
                    part_parent = bpy.data.objects[f"{dancer_index}.{part_name}.parent"]
                    if part_data.effect_id != -1:
                        part_effect = led_effect_table[part_data.effect_id].effect
                        for j, led_obj in enumerate(part_parent.children):
                            led_data = part_effect[j]
                            led_rgb = color_map[led_data.color_id].rgb
                            led_rgba = (
                                led_rgb[0] / 255,
                                led_rgb[1] / 255,
                                led_rgb[2] / 255,
                                led_data.alpha / 10,  # TODO: change to 255
                            )
                            if led_obj.animation_data is None:
                                led_obj.animation_data_create()
                            if led_obj.animation_data.action is None:
                                led_obj.animation_data.action = bpy.data.actions.new(
                                    f"{dancer_index}.{part_name}Action.{j:03}"
                                )
                            curves = led_obj.animation_data.action.fcurves
                            for d in range(4):
                                if curves.find("color", index=d) is None:
                                    curves.new("color", index=d)
                                    curves.find("color", index=d).keyframe_points.add(
                                        ctrl_frame_number
                                    )
                                point = curves.find("color", index=d).keyframe_points[i]
                                point.co = frame_start, led_rgba[d]
                                point.interpolation = "LINEAR" if fade else "CONSTANT"
                                if i == ctrl_frame_number - 1:
                                    curves.find("color", index=d).keyframe_points.sort()
                    else:  # no change
                        for j, led_obj in enumerate(part_parent.children):
                            curves = led_obj.animation_data.action.fcurves
                            for d in range(4):
                                if curves.find("color", index=d) is None:
                                    curves.new("color", index=d)
                                    curves.find("color", index=d).keyframe_points.add(
                                        ctrl_frame_number
                                    )
                                elif i == 0:
                                    curves.find(
                                        "location", index=d
                                    ).keyframe_points.clear()
                                    curves.find(
                                        "location", index=d
                                    ).keyframe_points.add(ctrl_frame_number)
                                point = curves.find("color", index=d).keyframe_points[i]
                                last_point = curves.find(
                                    "color", index=d
                                ).keyframe_points[i - 1]
                                point.co = frame_start, last_point.co[1]
                                point.interpolation = "LINEAR" if fade else "CONSTANT"
                                if i == ctrl_frame_number - 1:
                                    curves.find("color", index=d).keyframe_points.sort()

                elif isinstance(part_data, FiberData):
                    part_obj = bpy.data.objects[f"{dancer_index}.{part_name}"]
                    part_rgb = color_map[part_data.color_id].rgb
                    part_rgba = (
                        part_rgb[0] / 255,
                        part_rgb[1] / 255,
                        part_rgb[2] / 255,
                        part_data.alpha / 10,  # TODO: change to 255
                    )
                    if part_obj.animation_data is None:
                        part_obj.animation_data_create()
                    if part_obj.animation_data.action is None:
                        part_obj.animation_data.action = bpy.data.actions.new(
                            f"{dancer_index}.{part_name}Action"
                        )
                    curves = part_obj.animation_data.action.fcurves
                    for d in range(4):
                        if curves.find("color", index=d) is None:
                            curves.new("color", index=d)
                            curves.find("color", index=d).keyframe_points.add(
                                ctrl_frame_number
                            )
                        elif i == 0:
                            curves.find("location", index=d).keyframe_points.clear()
                            curves.find("location", index=d).keyframe_points.add(
                                ctrl_frame_number
                            )
                        point = curves.find("color", index=d).keyframe_points[i]
                        point.co = frame_start, part_rgba[d]
                        point.interpolation = "LINEAR" if fade else "CONSTANT"
                        if i == ctrl_frame_number - 1:
                            curves.find("color", index=d).keyframe_points.sort()
                else:
                    print("Invalid part data")
        # insert fake frame
        scene = bpy.context.scene
        if scene.animation_data is None:
            scene.animation_data_create()
        if scene.animation_data.action is None:
            scene.animation_data.action = bpy.data.actions.new("SceneAction")
        curves = scene.animation_data.action.fcurves
        if curves.find("ld_control_frame") is None:
            curves.new("ld_control_frame")
            curves.find("ld_control_frame").keyframe_points.add(ctrl_frame_number)
        curve_points = curves.find("ld_control_frame").keyframe_points
        curve_points[i].co = frame_start, frame_start
        curve_points[i].interpolation = "CONSTANT"
    curves = bpy.context.scene.animation_data.action.fcurves
    curves.find("ld_control_frame").keyframe_points.sort()
    fade_seq.sort(key=lambda item: item[0])
    curve_points = curves.find("ld_control_frame").keyframe_points
    for frame_start, fade in fade_seq:
        if fade:
            point_index = next(
                list(curve_points).index(p)
                for p in curve_points
                if p.co[0] == frame_start
            )
            if point_index == ctrl_frame_number - 1:
                continue
            curve_points[point_index + 1].co = (
                curve_points[point_index + 1].co[0],
                curve_points[point_index].co[1],
            )


def set_pos_keyframes_from_state():
    pos_map = state.pos_map
    pos_frame_number = len(pos_map)
    for i, (_, pos_map_element) in enumerate(pos_map.items()):
        frame_start = pos_map_element.start
        pos_status = pos_map_element.pos
        for dancer_name, pos in pos_status.items():
            dancer_obj = bpy.data.objects[dancer_name]
            dancer_location = (pos.x, pos.y, pos.z)
            if dancer_obj.animation_data is None:
                dancer_obj.animation_data_create()
            if dancer_obj.animation_data.action is None:
                dancer_obj.animation_data.action = bpy.data.actions.new(
                    dancer_name + "Action"
                )
            curves = dancer_obj.animation_data.action.fcurves
            for d in range(3):
                if curves.find("location", index=d) is None:
                    curves.new("location", index=d)
                    curves.find("location", index=d).keyframe_points.add(
                        pos_frame_number
                    )
                elif i == 0:
                    curves.find("location", index=d).keyframe_points.clear()
                    curves.find("location", index=d).keyframe_points.add(
                        pos_frame_number
                    )
                point = curves.find("location", index=d).keyframe_points[i]
                point.co = frame_start, dancer_location[d]
                point.interpolation = "LINEAR"
                if i == pos_frame_number - 1:
                    curves.find("location", index=d).keyframe_points.sort()
        # insert fake frame
        scene = bpy.context.scene
        if scene.animation_data is None:
            scene.animation_data_create()
        if scene.animation_data.action is None:
            scene.animation_data.action = bpy.data.actions.new("SceneAction")
        curves = scene.animation_data.action.fcurves
        if curves.find("ld_pos_frame") is None:
            curves.new("ld_pos_frame")
            curves.find("ld_pos_frame").keyframe_points.add(pos_frame_number)
        curves.find("ld_pos_frame").keyframe_points[i].co = frame_start, frame_start
        curves.find("ld_pos_frame").keyframe_points[i].interpolation = "CONSTANT"
        if i == pos_frame_number - 1:
            curves.find("ld_pos_frame").keyframe_points.sort()


"""
update position keyframes
"""


def add_single_pos_keyframe(pos_element: PosMapElement):
    frame_start = pos_element.start
    pos_status = pos_element.pos
    for dancer_name, pos in pos_status.items():
        dancer_obj = bpy.data.objects[dancer_name]
        dancer_location = (pos.x, pos.y, pos.z)
        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            point = curves.find("location", index=d).keyframe_points.insert(
                frame_start, dancer_location[d]
            )
            point.interpolation = "LINEAR"
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    point = curves.find("ld_pos_frame").keyframe_points.insert(frame_start, frame_start)
    point.interpolation = "CONSTANT"


def edit_single_pos_keyframe(pos_id: MapID, pos_element: PosMapElement):
    old_pos_map = state.pos_map  # pos_map before update
    old_frame_start = old_pos_map[pos_id].start
    new_frame_start = pos_element.start
    new_pos_status = pos_element.pos
    for dancer_name, pos in new_pos_status.items():
        dancer_obj = bpy.data.objects[dancer_name]
        dancer_location = (pos.x, pos.y, pos.z)
        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            curve_points = curves.find("location", index=d).keyframe_points
            point = next(p for p in curve_points if p.co[0] == old_frame_start)
            point.co = new_frame_start, dancer_location[d]
            point.interpolation = "LINEAR"
            curve_points.sort()
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    curve_points = curves.find("ld_pos_frame").keyframe_points
    point = next(p for p in curve_points if p.co[0] == old_frame_start)
    point.co = new_frame_start, new_frame_start
    point.interpolation = "CONSTANT"
    curve_points.sort()


def delete_single_pos_keyframe(pos_id: MapID):
    old_pos_map = state.pos_map  # pos_map before update
    old_frame_start = old_pos_map[pos_id].start
    old_pos_status = old_pos_map[pos_id].pos
    for dancer_name, _ in old_pos_status.items():
        dancer_obj = bpy.data.objects[dancer_name]
        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            curve_points = curves.find("location", index=d).keyframe_points
            point = next(p for p in curve_points if p.co[0] == old_frame_start)
            curve_points.remove(point)
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    curve_points = curves.find("ld_pos_frame").keyframe_points
    point = next(p for p in curve_points if p.co[0] == old_frame_start)
    curve_points.remove(point)


"""
update control keyframes
"""


def add_single_ctrl_keyframe(ctrl_element: ControlMapElement):
    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    frame_start = ctrl_element.start
    fade = ctrl_element.fade
    ctrl_status = ctrl_element.status
    for dancer_name, ctrl in ctrl_status.items():
        dancer_index = dancer_name.split("_")[0]
        for part_name, part_data in ctrl.items():
            if isinstance(part_data, LEDData):
                part_parent = bpy.data.objects[f"{dancer_index}.{part_name}.parent"]
                if part_data.effect_id != -1:
                    part_effect = led_effect_table[part_data.effect_id].effect
                    for j, led_obj in enumerate(part_parent.children):
                        led_data = part_effect[j]
                        led_rgb = color_map[led_data.color_id].rgb
                        led_rgba = (
                            led_rgb[0] / 255,
                            led_rgb[1] / 255,
                            led_rgb[2] / 255,
                            led_data.alpha / 10,  # TODO: change to 255
                        )
                        curves = led_obj.animation_data.action.fcurves
                        for d in range(4):
                            curve_points = curves.find("color", index=d).keyframe_points
                            point = curve_points.insert(frame_start, led_rgba[d])
                            point.interpolation = "LINEAR" if fade else "CONSTANT"
                            curve_points.sort()
                else:  # no change
                    for j, led_obj in enumerate(part_parent.children):
                        curves = led_obj.animation_data.action.fcurves
                        for d in range(4):
                            curve_points = curves.find("color", index=d).keyframe_points
                            last_point = [
                                p for p in curve_points if p.co[0] < frame_start
                            ][-1]
                            point = curve_points.insert(frame_start, last_point.co[1])
                            point.interpolation = "LINEAR" if fade else "CONSTANT"
                            curve_points.sort()

            elif isinstance(part_data, FiberData):
                part_obj = bpy.data.objects[f"{dancer_index}.{part_name}"]
                part_rgb = color_map[part_data.color_id].rgb
                part_rgba = (
                    part_rgb[0] / 255,
                    part_rgb[1] / 255,
                    part_rgb[2] / 255,
                    part_data.alpha / 10,  # TODO: change to 255
                )
                if part_obj.animation_data is None:
                    part_obj.animation_data_create()
                if part_obj.animation_data.action is None:
                    part_obj.animation_data.action = bpy.data.actions.new(
                        f"{dancer_index}.{part_name}Action"
                    )
                curves = part_obj.animation_data.action.fcurves
                for d in range(4):
                    curve_points = curves.find("color", index=d).keyframe_points
                    point = curve_points.insert(frame_start, part_rgba[d])
                    point.interpolation = "LINEAR" if fade else "CONSTANT"
                    curve_points.sort()
            else:
                print("Invalid part data")
    # insert fake frame
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    curve_points = curves.find("ld_control_frame").keyframe_points
    point = curve_points.insert(frame_start, frame_start)
    # update new ld_control_frame
    try:
        new_next_point = next(p for p in curve_points if p.co[0] > frame_start)
        new_next_fade_points = [
            p
            for p in curve_points
            if p.co[0] > frame_start and p.co[1] == new_next_point.co[1]
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
    curve_points.sort()
    point.interpolation = "CONSTANT"


def edit_single_ctrl_keyframe(ctrl_id: MapID, ctrl_element: ControlMapElement):
    color_map = state.color_map
    led_effect_table = state.led_effect_id_table
    old_ctrl_map = state.control_map  # control_map before update
    old_frame_start = old_ctrl_map[ctrl_id].start
    new_frame_start = ctrl_element.start
    new_ctrl_status = ctrl_element.status
    new_fade = ctrl_element.fade
    for dancer_name, ctrl in new_ctrl_status.items():
        dancer_index = dancer_name.split("_")[0]
        for part_name, part_data in ctrl.items():
            if isinstance(part_data, LEDData):
                part_parent = bpy.data.objects[f"{dancer_index}.{part_name}.parent"]
                if part_data.effect_id != -1:
                    part_effect = led_effect_table[part_data.effect_id].effect
                    for j, led_obj in enumerate(part_parent.children):
                        led_data = part_effect[j]
                        led_rgb = color_map[led_data.color_id].rgb
                        led_rgba = (
                            led_rgb[0] / 255,
                            led_rgb[1] / 255,
                            led_rgb[2] / 255,
                            led_data.alpha / 10,  # TODO: change to 255
                        )
                        curves = led_obj.animation_data.action.fcurves
                        for d in range(4):
                            curve_points = curves.find("color", index=d).keyframe_points
                            point = next(
                                p for p in curve_points if p.co[0] == old_frame_start
                            )
                            point.co = new_frame_start, led_rgba[d]
                            point.interpolation = "LINEAR" if new_fade else "CONSTANT"
                            curve_points.sort()
                else:  # no change
                    for j, led_obj in enumerate(part_parent.children):
                        curves = led_obj.animation_data.action.fcurves
                        for d in range(4):
                            curve_points = curves.find("color", index=d).keyframe_points
                            last_point = [
                                p for p in curve_points if p.co[0] < old_frame_start
                            ][-1]
                            point = next(
                                p for p in curve_points if p.co[0] == old_frame_start
                            )
                            point.co = new_frame_start, last_point.co[1]
                            point.interpolation = "LINEAR" if new_fade else "CONSTANT"
                            curve_points.sort()

            elif isinstance(part_data, FiberData):
                part_obj = bpy.data.objects[f"{dancer_index}.{part_name}"]
                part_rgb = color_map[part_data.color_id].rgb
                part_rgba = (
                    part_rgb[0] / 255,
                    part_rgb[1] / 255,
                    part_rgb[2] / 255,
                    part_data.alpha / 10,  # TODO: change to 255
                )
                curves = part_obj.animation_data.action.fcurves
                for d in range(4):
                    curve_points = curves.find("color", index=d).keyframe_points
                    point = next(p for p in curve_points if p.co[0] == old_frame_start)
                    point.co = new_frame_start, part_rgba[d]
                    point.interpolation = "LINEAR" if new_fade else "CONSTANT"
                    curve_points.sort()
            else:
                print("Invalid part data")
    # update fake frame
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    curve_points = curves.find("ld_control_frame").keyframe_points
    point = next(p for p in curve_points if p.co[0] == old_frame_start)
    # update old ld_control_frame
    try:
        old_next_point = next(p for p in curve_points if p.co[0] > old_frame_start)
        old_next_fade_points = [
            p
            for p in curve_points
            if p.co[0] > old_frame_start and p.co[1] == old_next_point.co[1]
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
        new_next_point = next(p for p in curve_points if p.co[0] > new_frame_start)
        new_next_fade_points = [
            p
            for p in curve_points
            if p.co[0] > new_frame_start and p.co[1] == new_next_point.co[1]
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
    curve_points.sort()


def delete_single_ctrl_keyframe(ctrl_id: MapID):
    old_ctrl_map = state.control_map  # pos_map before update
    old_frame_start = old_ctrl_map[ctrl_id].start
    old_ctrl_status = old_ctrl_map[ctrl_id].status
    for dancer_name, ctrl in old_ctrl_status.items():
        dancer_index = dancer_name.split("_")[0]
        for part_name, part_data in ctrl.items():
            if isinstance(part_data, LEDData):
                part_parent = bpy.data.objects[f"{dancer_index}.{part_name}.parent"]
                for led_obj in part_parent.children:
                    curves = led_obj.animation_data.action.fcurves
                    for d in range(4):
                        curve_points = curves.find("color", index=d).keyframe_points
                        point = next(
                            p for p in curve_points if p.co[0] == old_frame_start
                        )
                        curve_points.remove(point)

            elif isinstance(part_data, FiberData):
                part_obj = bpy.data.objects[f"{dancer_index}.{part_name}"]
                curves = part_obj.animation_data.action.fcurves
                for d in range(4):
                    curve_points = curves.find("color", index=d).keyframe_points
                    point = next(p for p in curve_points if p.co[0] == old_frame_start)
                    curve_points.remove(point)
            else:
                print("Invalid part data")
    # insert fake frame
    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves
    curve_points = curves.find("ld_control_frame").keyframe_points
    point = next(p for p in curve_points if p.co[0] == old_frame_start)
    # update old ld_control_frame
    try:
        old_next_point = next(p for p in curve_points if p.co[0] > old_frame_start)
        old_next_fade_points = [
            p
            for p in curve_points
            if p.co[0] > old_frame_start and p.co[1] == old_next_point.co[1]
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
    curve_points.remove(point)
