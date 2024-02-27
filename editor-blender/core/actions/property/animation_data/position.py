from typing import Dict, Optional, cast

import bpy

from .....properties.types import RevisionPropertyItemType, RevisionPropertyType
from ....models import MapID, PosMapElement
from ....states import state
from .utils import ensure_action, ensure_curve, get_keyframe_points

"""
setups & update colormap(===setups)
"""


def set_pos_keyframes_from_state():
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    pos_map = state.pos_map
    pos_frame_number = len(pos_map)

    sorted_pos_map = sorted(pos_map.items(), key=lambda item: item[1].start)

    for i, (id, pos_map_element) in enumerate(sorted_pos_map):
        frame_start = pos_map_element.start
        pos_status = pos_map_element.pos

        for dancer_name, pos in pos_status.items():
            dancer_location = (pos.x, pos.y, pos.z)

            dancer_obj = data_objects[dancer_name]
            action = ensure_action(dancer_obj, dancer_name + "Action")

            for d in range(3):
                curve = ensure_curve(
                    action,
                    "location",
                    index=d,
                    keyframe_points=pos_frame_number,
                    clear=i == 0,
                )

                _, kpoints_list = get_keyframe_points(curve)
                point = kpoints_list[i]
                point.co = frame_start, dancer_location[d]

                point.interpolation = "LINEAR"

                point.select_control_point = False

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

        # curve = ensure_curve(
        #     action, "ld_pos_meta", keyframe_points=pos_frame_number, clear=i == 0
        # )
        # _, kpoints_list = get_keyframe_points(curve)
        #
        # point = kpoints_list[i]
        # point.co = frame_start, rev.meta
        # point.interpolation = "CONSTANT"
        #
        # curve = ensure_curve(
        #     action, "ld_pos_data", keyframe_points=pos_frame_number, clear=i == 0
        # )
        # _, kpoints_list = get_keyframe_points(curve)
        #
        # point = kpoints_list[i]
        # point.co = frame_start, rev.data
        # point.interpolation = "CONSTANT"

        pos_rev_item: RevisionPropertyItemType = getattr(
            bpy.context.scene, "ld_pos_rev"
        ).add()

        pos_rev_item.data = rev.data if rev else -1
        pos_rev_item.meta = rev.meta if rev else -1

        pos_rev_item.frame_id = id
        pos_rev_item.frame_start = frame_start


"""
update position keyframes
"""


def add_single_pos_keyframe(id: MapID, pos_element: PosMapElement):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    frame_start = pos_element.start
    pos_status = pos_element.pos

    for dancer_name, pos in pos_status.items():
        dancer_location = (pos.x, pos.y, pos.z)
        dancer_obj = data_objects[dancer_name]

        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            point = curves.find("location", index=d).keyframe_points.insert(
                frame_start, dancer_location[d]
            )
            point.interpolation = "LINEAR"

    scene = bpy.context.scene
    curves = scene.animation_data.action.fcurves

    curve = curves.find("ld_pos_frame")
    point = curve.keyframe_points.insert(frame_start, frame_start)
    point.interpolation = "CONSTANT"

    # insert rev frame (meta & data)
    rev = pos_element.rev

    # curve = curves.find("ld_pos_meta")
    # point = curve.keyframe_points.insert(frame_start, (rev.meta if rev else -1))
    # point.interpolation = "CONSTANT"
    #
    # curve = curves.find("ld_pos_data")
    # point = curve.keyframe_points.insert(frame_start, (rev.data if rev else -1))
    # point.interpolation = "CONSTANT"

    pos_rev: RevisionPropertyItemType = getattr(bpy.context.scene, "ld_pos_rev").add()

    pos_rev.data = rev.data if rev else -1
    pos_rev.meta = rev.meta if rev else -1

    pos_rev.frame_id = id
    pos_rev.frame_start = frame_start


def edit_single_pos_keyframe(
    pos_id: MapID, pos_element: PosMapElement, frame_start: Optional[int] = None
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    old_pos_map = state.pos_map  # pos_map before update

    if frame_start is None:
        old_pos_frame = old_pos_map[pos_id]
        old_frame_start = old_pos_frame.start
    else:
        old_frame_start = frame_start

    new_pos_status = pos_element.pos
    new_frame_start = pos_element.start

    update_time = old_frame_start != new_frame_start

    for dancer_name, pos in new_pos_status.items():
        dancer_location = (pos.x, pos.y, pos.z)
        dancer_obj = data_objects[dancer_name]

        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            curve = curves.find("location", index=d)
            kpoints, kpoints_list = get_keyframe_points(curve)

            point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
            point.co = new_frame_start, dancer_location[d]

            point.interpolation = "LINEAR"

            if update_time:
                kpoints.sort()

    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_pos_frame")
    kpoints, kpoints_list = get_keyframe_points(curve)

    point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    point.co = new_frame_start, new_frame_start

    if update_time:
        kpoints.sort()

    # insert rev frame (meta & data)
    rev = pos_element.rev

    # meta keyframe
    # curve = curves.find("ld_pos_meta")
    # kpoints, kpoints_list = get_keyframe_points(curve)
    #
    # point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    # point.co = new_frame_start, rev.meta
    #
    # if update_time:
    #     kpoints.sort()

    # data keyframe
    # curve = curves.find("ld_pos_data")
    # kpoints, kpoints_list = get_keyframe_points(curve)
    #
    # point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    # point.co = new_frame_start, rev.data
    #
    # if update_time:
    #     kpoints.sort()

    # update rev frame
    pos_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    try:
        pos_rev_item = next(
            item for item in pos_rev if getattr(item, "frame_id") == pos_id
        )

        pos_rev_item.data = rev.data if rev else -1
        pos_rev_item.meta = rev.meta if rev else -1

        pos_rev_item.frame_id = pos_id
        pos_rev_item.frame_start = new_frame_start

    except StopIteration:
        pass


def delete_single_pos_keyframe(
    pos_id: MapID, incoming_frame_start: Optional[int] = None
):
    data_objects = cast(Dict[str, bpy.types.Object], bpy.data.objects)

    if incoming_frame_start is None:
        old_pos_map = state.pos_map  # pos_map before update
        old_frame_start = old_pos_map[pos_id].start
    else:
        old_frame_start = incoming_frame_start

    dancers_array = state.dancers_array
    for dancer_item in dancers_array:
        dancer_name = dancer_item.name
        dancer_obj = data_objects[dancer_name]

        curves = dancer_obj.animation_data.action.fcurves
        for d in range(3):
            curve = curves.find("location", index=d)
            kpoints, kpoints_list = get_keyframe_points(curve)

            point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
            kpoints.remove(point)

    scene = bpy.context.scene

    curves = scene.animation_data.action.fcurves
    curve = curves.find("ld_pos_frame")
    kpoints, kpoints_list = get_keyframe_points(curve)

    point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    kpoints.remove(point)

    # delete rev frame (meta & data)
    # curve = curves.find("ld_pos_meta")
    # kpoints, kpoints_list = get_keyframe_points(curve)
    #
    # point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    # kpoints.remove(point)
    #
    # curve = curves.find("ld_pos_data")
    # kpoints, kpoints_list = get_keyframe_points(curve)
    #
    # point = next(p for p in kpoints_list if p.co[0] == old_frame_start)
    # kpoints.remove(point)

    pos_rev: RevisionPropertyType = getattr(bpy.context.scene, "ld_pos_rev")
    try:
        pos_rev_index = next(
            i for i, item in enumerate(pos_rev) if getattr(item, "frame_id") == pos_id
        )
        pos_rev.remove(pos_rev_index)  # type: ignore

    except StopIteration:
        pass
