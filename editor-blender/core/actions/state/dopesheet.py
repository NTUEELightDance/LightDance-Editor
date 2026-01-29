"""
Docstring for editor-blender.core.actions.state.dopesheet

-This is a file for handling timeline display when 
-1. a dancer or part is selected
-2. a dancer or part is pinned
"""

from enum import Enum
from functools import partial

import bpy

from ....core.models import (
    ControlMap_MODIFIED,
    ControlMapElement_MODIFIED,
    Editor,
    MapID,
    PosMap,
    PosMapElement,
    SelectMode,
)
from ....core.states import state
from ....core.utils.algorithms import smallest_range_including_lr
from ....properties.types import ObjectType
from ...utils.notification import notify
from ...utils.ui import redraw_area, set_dopesheet_collapse_all, set_dopesheet_filter
from ..property.animation_data.utils import (
    ensure_action,
    ensure_curve,
    get_keyframe_points,
)


class KeyframeType(Enum):
    NORMAL = 0
    GENERATED = 1
    BREAKDOWN = 2


def get_effective_name(name: str) -> str:
    if name.endswith("_LED"):
        return f"{name}.000"
    return name


def delete_obj(obj_name: str):
    obj = bpy.data.objects.get(obj_name)

    if obj:
        action = obj.animation_data.action

        if action:
            obj.animation_data_clear()
            bpy.data.actions.remove(action)

        bpy.data.objects.remove(obj)
        # notify("INFO", f"Removed {obj_name}")

    return


"""
fade_seq: list of (start_frame(int), fade(bool), keyframe_type(KeyframeType))
"""


def draw_fade_on_curve(
    action: bpy.types.Action,
    data_path: str,
    fade_seq: list[tuple[int, bool, KeyframeType]],
):
    total_effective_ctrl_frame_number = len(fade_seq)
    curve = ensure_curve(
        action,
        data_path,
        keyframe_points=total_effective_ctrl_frame_number,
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)

    for i, (start, _, keyframe_type) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        if keyframe_type == KeyframeType.GENERATED:
            point.type = "GENERATED"
        elif keyframe_type == KeyframeType.BREAKDOWN:
            point.type = "BREAKDOWN"

        point.interpolation = "CONSTANT"
        point.select_control_point = False


"""
pos_seq: list of (start_frame(int), keyframe_type(KeyframeType))
"""


def draw_pos_on_curve(
    action: bpy.types.Action, data_path: str, pos_seq: list[tuple[int, KeyframeType]]
):
    total_effective_pos_frame_number = len(pos_seq)
    curve = ensure_curve(
        action,
        data_path,
        keyframe_points=total_effective_pos_frame_number,
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)

    for i, (start, keyframe_type) in enumerate(pos_seq):
        point = kpoints_list[i]
        point.co = start, start

        if keyframe_type == KeyframeType.GENERATED:
            point.type = "GENERATED"
        elif keyframe_type == KeyframeType.BREAKDOWN:
            point.type = "BREAKDOWN"

        point.interpolation = "LINEAR"
        point.select_control_point = False


def get_filtered_map_for_first_timeline(
    l_timerange: int,
    r_timerange: int,
    sorted_map: ControlMap_MODIFIED | PosMap,
    sorted_frame_map: list[int],
) -> tuple[
    int,
    int,
    list[(MapID, ControlMapElement_MODIFIED)] | list[(MapID, PosMapElement)] | list,
]:
    filtered_map = []
    start_index = -1
    end_index = -1
    if sorted_frame_map:
        (start_index, end_index) = smallest_range_including_lr(
            sorted_frame_map, l_timerange, r_timerange
        )
        filtered_map = sorted_map[start_index : end_index + 1]

    return start_index, end_index, filtered_map


"""
The code below filters the smallest range in a sort_map that satisfies the 3 following conditions:
1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
2. The borders' frame.start isn't state.dancer_load_frames[0] or state.dancer_load_frames[1]
3. The status of the borders' frame isn't None
"""


def get_filtered_map_for_second_timeline(
    l_timerange: int,
    r_timerange: int,
    init_start_index: int,
    init_end_index: int,
    sorted_map: ControlMap_MODIFIED | PosMap,
    dancer_name: str,
    part_name: str | None = None,
) -> list[(MapID, ControlMapElement_MODIFIED)] | list[(MapID, PosMapElement)] | list:
    if not sorted_map:
        return []

    start_index = init_start_index
    end_index = init_end_index

    def has_status(frame: ControlMapElement_MODIFIED | PosMapElement) -> bool:
        if state.editor == Editor.CONTROL_EDITOR:
            dancer_status = frame.status[dancer_name]

            if state.selection_mode == SelectMode.PART_MODE:
                return dancer_status[part_name] is not None
            elif state.selection_mode == SelectMode.DANCER_MODE:
                return any(
                    part_status is not None for part_status in dancer_status.values()
                )

        elif state.editor == Editor.POS_EDITOR:
            return frame.pos[dancer_name] is not None

    while True:
        if start_index == 0 or (
            sorted_map[init_start_index][1].start != l_timerange
            and has_status(sorted_map[start_index][1])
        ):
            break
        start_index -= 1

        if has_status(sorted_map[start_index][1]):
            break

    while True:
        if end_index == len(sorted_map) - 1 or (
            sorted_map[init_end_index][1].start != r_timerange
            and has_status(sorted_map[start_index][1])
        ):
            break

        end_index += 1

        if has_status(sorted_map[end_index][1]):
            break

    notify("INFO", f"{start_index}")
    notify("INFO", f"{end_index}")
    return sorted_map[start_index : end_index + 1]


def update_ctrl_data(
    current_obj_name: str, old_selected_obj_name: str, ld_object_type: str
):
    delete_obj("control_frame")
    delete_obj(f"selected_{old_selected_obj_name}")

    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj:
        sorted_ctrl_map = sorted(
            state.control_map_MODIFIED.items(), key=lambda item: item[1].start
        )
        sorted_frame_ctrl_map = [item[1].start for item in sorted_ctrl_map]
        dancer_name = getattr(current_obj, "ld_dancer_name")
        part_name = None
        if ld_object_type == ObjectType.LIGHT.value:
            part_name = getattr(current_obj, "ld_part_name")

        # setup fade for control frame
        ctrl_obj = bpy.data.objects.new("control_frame", None)

        if ctrl_obj.animation_data is None:
            ctrl_obj.animation_data_create()

        action_name = f"{ctrl_obj.name}Action"
        ctrl_action = ensure_action(ctrl_obj, action_name)

        # fade sequence for fade_for_new_status (with parital load)
        frame_range_l, frame_range_r = state.dancer_load_frames

        (
            filtered_ctrl_map_start,
            filtered_ctrl_map_end,
            filtered_ctrl_map,
        ) = get_filtered_map_for_first_timeline(
            frame_range_l, frame_range_r, sorted_ctrl_map, sorted_frame_ctrl_map
        )

        dancer_fade_seq = []
        for _, frame in filtered_ctrl_map:
            active_dancers = [
                dancer
                for dancer, parts in frame.status.items()
                if any(part is not None for part in parts.values())
            ]

            if active_dancers:
                is_generated = all(
                    not state.show_dancers[state.dancer_names.index(dancer)]
                    for dancer in active_dancers
                )

                if is_generated:
                    dancer_fade_seq.append(
                        (frame.start, frame.fade_for_new_status, KeyframeType.GENERATED)
                    )
                else:
                    dancer_fade_seq.append(
                        (frame.start, frame.fade_for_new_status, KeyframeType.NORMAL)
                    )

            else:
                dancer_fade_seq.append(
                    (frame.start, frame.fade_for_new_status, KeyframeType.BREAKDOWN)
                )

        draw_fade_on_curve(ctrl_action, "fade_for_new_status", dancer_fade_seq)

        # setup fade for selected part object
        selected_part = bpy.data.objects.new(f"selected_{current_obj_name}", None)
        if selected_part.animation_data is None:
            selected_part.animation_data_create()

        selected_action = ensure_action(
            selected_part, f"selected_{current_obj_name}Action"
        )

        # fade sequence for the selected part object (with parital load)
        filtered_ctrl_map = get_filtered_map_for_second_timeline(
            frame_range_l,
            frame_range_r,
            filtered_ctrl_map_start,
            filtered_ctrl_map_end,
            sorted_ctrl_map,
            dancer_name,
            part_name,
        )

        part_fade_seq = []
        if ld_object_type == ObjectType.LIGHT.value:
            part_fade_seq = [
                (
                    frame.start,
                    frame.status[dancer_name][part_name].fade,
                    KeyframeType.NORMAL,
                )  # type:ignore
                for _, frame in filtered_ctrl_map
                if frame.status[dancer_name][part_name] is not None
            ]

        elif ld_object_type == ObjectType.DANCER.value:
            for _, frame in filtered_ctrl_map:
                active_parts = [
                    part
                    for part in frame.status[dancer_name].values()
                    if part is not None
                ]

                if active_parts:
                    part_fade_seq.append(
                        (
                            frame.start,
                            any(part.fade for part in active_parts),
                            KeyframeType.NORMAL,
                        )
                    )

        draw_fade_on_curve(selected_action, "fade_for_selected_object", part_fade_seq)

        ctrl_obj.select_set(False)
        selected_part.select_set(False)
        bpy.context.collection.objects.link(ctrl_obj)
        bpy.context.collection.objects.link(selected_part)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    set_dopesheet_filter(f"fade")
    set_dopesheet_collapse_all(True)

    return None


def update_pos_data(current_obj_name: str, old_selected_obj_name: str):
    delete_obj("pos_frame")
    delete_obj(f"selected_{old_selected_obj_name}")
    current_obj = bpy.data.objects.get(current_obj_name)

    if current_obj:
        sorted_pos_map = sorted(
            state.pos_map_MODIFIED.items(), key=lambda item: item[1].start
        )
        sorted_frame_pos_map = [item[1].start for item in sorted_pos_map]

        dancer_name = getattr(current_obj, "ld_dancer_name")

        # setup pos for pos frame
        pos_obj = bpy.data.objects.new("pos_frame", None)

        if pos_obj.animation_data is None:
            pos_obj.animation_data_create()

        action_name = f"{pos_obj.name}Action"
        pos_action = ensure_action(pos_obj, action_name)

        # pos_map for pos frame (with partial load)
        frame_range_l, frame_range_r = state.dancer_load_frames
        (
            filtered_pos_map_start,
            filtered_pos_map_end,
            filtered_pos_map,
        ) = get_filtered_map_for_first_timeline(
            frame_range_l, frame_range_r, sorted_pos_map, sorted_frame_pos_map
        )

        pos_start_record = []
        for _, frame in filtered_pos_map:
            active_dancers = [
                dancer for dancer, pos in frame.pos.items() if pos is not None
            ]
            if active_dancers:
                is_generated = all(
                    not state.show_dancers[state.dancer_names.index(dancer)]
                    for dancer in active_dancers
                )

                if is_generated:
                    pos_start_record.append((frame.start, KeyframeType.GENERATED))
                else:
                    pos_start_record.append((frame.start, KeyframeType.NORMAL))

            else:
                pos_start_record.append((frame.start, KeyframeType.BREAKDOWN))

        draw_pos_on_curve(
            pos_action,
            "pos_selected_overall",
            pos_start_record,
        )

        # setup pos for selected dancer
        selected_dancer = bpy.data.objects.new(f"selected_{current_obj_name}", None)

        if selected_dancer.animation_data is None:
            selected_dancer.animation_data_create()

        action_name = f"selected_{current_obj_name}Action"
        selected_action = ensure_action(selected_dancer, action_name)

        # pos map for selected dancer (with partial load)
        filtered_pos_map = get_filtered_map_for_second_timeline(
            frame_range_l,
            frame_range_r,
            filtered_pos_map_start,
            filtered_pos_map_end,
            sorted_pos_map,
            dancer_name,
        )

        dancer_pos_start_record = [
            (frame.start, KeyframeType.NORMAL)
            for _, frame in filtered_pos_map
            if frame.pos[dancer_name] is not None
        ]

        draw_pos_on_curve(
            selected_action,
            "pos_selected_dancer",
            dancer_pos_start_record,
        )

        pos_obj.select_set(False)
        selected_dancer.select_set(False)
        bpy.context.collection.objects.link(pos_obj)
        bpy.context.collection.objects.link(selected_dancer)

        redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

        set_dopesheet_filter(f"selected")
        set_dopesheet_collapse_all(True)

    return None


def deselect_timeline(old_selected_obj_name: str):
    delete_obj("control_frame")
    delete_obj("pos_frame")
    delete_obj(f"selected_{old_selected_obj_name}")

    if state.editor == Editor.CONTROL_EDITOR:
        set_dopesheet_filter("control_frame")
    elif state.editor == Editor.POS_EDITOR:
        set_dopesheet_filter("pos_frame")
    set_dopesheet_collapse_all(False)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    return None


def handle_select_timeline(
    obj: bpy.types.Object | None,
):
    state_current_name = state.current_selected_obj_name
    current_name = ""
    old_name = ""

    if obj:
        if state_current_name == obj.name:
            return

        ld_object_type = getattr(obj, "ld_object_type")

        # set control frame
        if state.editor == Editor.CONTROL_EDITOR:
            current_name = get_effective_name(obj.name)

            if state_current_name:
                old_name = get_effective_name(state_current_name)

            state.current_selected_obj_name = obj.name

            handle_ctrl_data_task = partial(
                update_ctrl_data, current_name, old_name, ld_object_type
            )
            bpy.app.timers.register(handle_ctrl_data_task)

        # set pos frame
        elif (
            state.editor == Editor.POS_EDITOR
            and ld_object_type == ObjectType.DANCER.value
        ):
            current_name = obj.name
            if state_current_name:
                old_name = state_current_name

            state.current_selected_obj_name = obj.name

            handle_pos_data_task = partial(update_pos_data, current_name, old_name)
            bpy.app.timers.register(handle_pos_data_task)

        notify("INFO", f"Current Selected: {obj.name}")
        return

    else:
        if state_current_name:
            old_name = get_effective_name(state_current_name)
            state.current_selected_obj_name = None
            deselect_task = partial(deselect_timeline, old_name)
            bpy.app.timers.register(deselect_task)
            return

    return
