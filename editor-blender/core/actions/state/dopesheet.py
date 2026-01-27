"""
Docstring for editor-blender.core.actions.state.dopesheet

-This is a file for handling timeline display when 
-1. a dancer or part is selected
-2. a dancer or part is pinned
"""

from enum import Enum
from functools import partial

import bpy

from ....core.models import Editor, SelectMode
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


def update_ctrl_data(current_obj_name: str, old_selected_obj_name: str):
    delete_obj("control_frame")
    delete_obj(f"selected_{old_selected_obj_name}")

    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj:
        sorted_ctrl_map = sorted(
            state.control_map_MODIFIED.items(), key=lambda item: item[1].start
        )
        sorted_frame_ctrl_map = [item[1].start for item in sorted_ctrl_map]
        dancer_name = getattr(current_obj, "ld_dancer_name")
        part_name = getattr(current_obj, "ld_part_name")

        # setup fade for control frame
        ctrl_obj = bpy.data.objects.new("control_frame", None)

        if ctrl_obj.animation_data is None:
            ctrl_obj.animation_data_create()

        action_name = f"{ctrl_obj.name}Action"
        ctrl_action = ensure_action(ctrl_obj, action_name)

        # fade sequence for fade_for_new_status (with parital load)
        filtered_ctrl_map = []
        filtered_ctrl_map_start = 0
        filtered_ctrl_map_end = 0
        frame_range_l, frame_range_r = state.dancer_load_frames
        if sorted_frame_ctrl_map:
            (
                filtered_ctrl_map_start,
                filtered_ctrl_map_end,
            ) = smallest_range_including_lr(
                sorted_frame_ctrl_map, frame_range_l, frame_range_r
            )
            filtered_ctrl_map = sorted_ctrl_map[
                filtered_ctrl_map_start : filtered_ctrl_map_end + 1
            ]

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
        """
        The code below filters the smallest range in sorted_ctrl_map that satisfies the 3 following conditions:
        1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
        2. The borders' frame.start isn't state.dancer_load_frames[0] or state.dancer_load_frames[1]
        3. The status of the borders' frame isn't None
        """
        while True:
            _, frame = sorted_ctrl_map[filtered_ctrl_map_start]
            if filtered_ctrl_map_start == 0 or frame.start != frame_range_l:
                break
            filtered_ctrl_map_start -= 1

            if frame.status[dancer_name][part_name] is not None:
                break

        while True:
            _, frame = sorted_ctrl_map[filtered_ctrl_map_end]
            if (
                filtered_ctrl_map_end == len(sorted_ctrl_map) - 1
                or frame.start != frame_range_r
            ):
                break

            filtered_ctrl_map_end += 1

            if frame.status[dancer_name][part_name] is not None:
                break

        filtered_ctrl_map = sorted_ctrl_map[
            filtered_ctrl_map_start : filtered_ctrl_map_end + 1
        ]

        part_fade_seq = [
            (
                frame.start,
                frame.status[dancer_name][part_name].fade,
                KeyframeType.NORMAL,
            )  # type:ignore
            for _, frame in filtered_ctrl_map
            if frame.status[dancer_name][part_name] is not None
        ]

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
        filtered_pos_map = []
        filtered_pos_map_start = 0
        filtered_pos_map_end = 0
        frame_range_l, frame_range_r = state.dancer_load_frames
        if sorted_frame_pos_map:
            filtered_pos_map_start, filtered_pos_map_end = smallest_range_including_lr(
                sorted_frame_pos_map, frame_range_l, frame_range_r
            )
            filtered_pos_map = sorted_pos_map[
                filtered_pos_map_start : filtered_pos_map_end + 1
            ]

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
        """
        The code below filters the smallest range in sorted_pos_map that satisfies the 3 following conditions:
        1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
        2. The borders' frame.start isn't state.dancer_load_frames[0] or state.dancer_load_frames[1]
        3. The status of the borders' frame isn't None
        """
        while True:
            _, frame = sorted_pos_map[filtered_pos_map_start]
            if filtered_pos_map_start == 0 or frame.start != frame_range_l:
                break
            filtered_pos_map_start -= 1

            if frame.pos[dancer_name] is not None:
                break

        while True:
            _, frame = sorted_pos_map[filtered_pos_map_end]
            if (
                filtered_pos_map_end == len(sorted_pos_map) - 1
                or frame.start != frame_range_r
            ):
                break

            filtered_pos_map_end += 1

            if frame.pos[dancer_name] is not None:
                break

        filtered_pos_map = sorted_pos_map[
            filtered_pos_map_start : filtered_pos_map_end + 1
        ]

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
        if (
            state.editor == Editor.CONTROL_EDITOR
            and state.selection_mode == SelectMode.PART_MODE
            and ld_object_type == ObjectType.LIGHT.value
        ):
            current_name = get_effective_name(obj.name)

            if state_current_name:
                old_name = get_effective_name(state_current_name)

            state.current_selected_obj_name = obj.name

            handle_ctrl_data_task = partial(update_ctrl_data, current_name, old_name)
            bpy.app.timers.register(handle_ctrl_data_task)

        # set pos frame
        elif (
            (
                state.editor == Editor.CONTROL_EDITOR
                and state.selection_mode == SelectMode.DANCER_MODE
            )
            or (state.editor == Editor.POS_EDITOR)
        ) and ld_object_type == ObjectType.DANCER.value:
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
