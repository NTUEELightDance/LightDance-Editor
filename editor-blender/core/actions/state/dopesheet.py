"""
Docstring for editor-blender.core.actions.state.dopesheet

-This is a file for handling timeline display when 
-1. a dancer or part is selected
-2. a dancer or part is pinned
"""

from functools import partial
from typing import cast

import bpy

from ....core.models import ControlMapElement_MODIFIED, Editor, MapID, PosMapElement
from ....core.states import state
from ....core.utils.algorithms import smallest_range_including_lr
from ....properties.types import ObjectType
from ...models import KeyframeType
from ...utils.notification import notify
from ...utils.ui import redraw_area, set_dopesheet_collapse_all, set_dopesheet_filter
from ..property.animation_data.utils import (
    delete_curve,
    ensure_action,
    ensure_curve,
    get_keyframe_points,
)


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


def add_obj(
    obj_name: str,
    action_name: str,
    map_type: str,
    curve_name: str,
    curve_data: list[tuple[int, bool, KeyframeType]] | list[tuple[int, KeyframeType]],
):
    if not bpy.context:
        return

    new_obj = bpy.data.objects.new(obj_name, None)
    if new_obj.animation_data is None:
        new_obj.animation_data_create()

    obj_action = ensure_action(new_obj, action_name)

    if map_type == "CONTROL":
        fade_seq = cast(list[tuple[int, bool, KeyframeType]], curve_data)
        draw_fade_on_curve(obj_action, curve_name, fade_seq)
    elif map_type == "POS":
        pos_seq = cast(list[tuple[int, KeyframeType]], curve_data)
        draw_pos_on_curve(obj_action, curve_name, pos_seq)

    new_obj.select_set(False)
    bpy.context.collection.objects.link(new_obj)


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

    return


def get_filtered_map_for_first_timeline(
    l_timerange: int,
    r_timerange: int,
    sorted_map: list[tuple[MapID, ControlMapElement_MODIFIED]]
    | list[tuple[MapID, PosMapElement]],
    sorted_frame_map: list[int],
    return_filtered_map: bool,
) -> (
    tuple[
        int,
        int,
        list[tuple[MapID, ControlMapElement_MODIFIED]]
        | list[tuple[MapID, PosMapElement]],
    ]
    | tuple[int, int]
):
    filtered_map = []
    start_index = -1
    end_index = -1
    if sorted_frame_map:
        (start_index, end_index) = smallest_range_including_lr(
            sorted_frame_map, l_timerange, r_timerange
        )

        if not return_filtered_map:
            return start_index, end_index

        filtered_map = sorted_map[start_index : end_index + 1]

    return start_index, end_index, filtered_map


def get_filtered_map_for_second_timeline(
    l_timerange: int,
    r_timerange: int,
    init_start_index: int,
    init_end_index: int,
    sorted_map: list[tuple[MapID, ControlMapElement_MODIFIED]]
    | list[tuple[MapID, PosMapElement]],
    dancer_name: str,
    map_type: str,
) -> list[tuple[MapID, ControlMapElement_MODIFIED]] | list[tuple[MapID, PosMapElement]]:
    """
    The code below filters the smallest range in a sort_map that satisfies the 3 following conditions:
    1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
    2. The borders' frame.start aren't state.dancer_load_frames[0] or state.dancer_load_frames[1]
    3. The status of the borders' frames aren't None
    """

    if not sorted_map:
        return []

    start_index = init_start_index
    end_index = init_end_index

    def has_status(frame: ControlMapElement_MODIFIED | PosMapElement) -> bool:
        if map_type == "CONTROL":
            frame = cast(ControlMapElement_MODIFIED, frame)

            dancer_status = frame.status[dancer_name]

            return any(
                part_status is not None for part_status in dancer_status.values()
            )

        elif map_type == "POS":
            frame = cast(PosMapElement, frame)
            return frame.pos[dancer_name] is not None

        return False

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
            and has_status(sorted_map[end_index][1])
        ):
            break

        end_index += 1

        if has_status(sorted_map[end_index][1]):
            break

    return sorted_map[start_index : end_index + 1]


def reset_selected_ctrl_data(current_obj_name: str, old_selected_obj_name: str):
    current_obj = bpy.data.objects.get(current_obj_name)
    old_obj = bpy.data.objects.get(f"[1]selected_{old_selected_obj_name}")

    if current_obj:
        dancer_name = getattr(current_obj, "ld_dancer_name")

        if not old_obj:
            add_obj(
                f"[1]selected_{current_obj_name}",
                f"selected_{current_obj_name}Action",
                "CONTROL",
                "ld_fade_seq",
                state.dancer_fade_sequence_map[dancer_name],
            )

        else:
            action = ensure_action(old_obj, f"selected_{old_selected_obj_name}Action")
            draw_fade_on_curve(
                action,
                "ld_fade_seq",
                state.dancer_fade_sequence_map[dancer_name],
            )

            action.name = f"selected_{current_obj_name}Action"
            old_obj.name = f"[1]selected_{current_obj_name}"

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    set_dopesheet_filter(f"fade_seq")
    set_dopesheet_collapse_all(True)

    return None


def reset_selected_pos_data(current_obj_name: str, old_selected_obj_name: str):
    old_obj = bpy.data.objects.get(f"[1]selected_{old_selected_obj_name}")
    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj:
        dancer_name = getattr(current_obj, "ld_dancer_name")

        if not old_obj:
            add_obj(
                f"[1]selected_{current_obj_name}",
                f"selected_{current_obj_name}Action",
                "POS",
                "ld_pos_seq",
                state.dancer_pos_sequence_map[dancer_name],
            )

        else:
            action = ensure_action(old_obj, f"selected_{old_selected_obj_name}Action")
            draw_pos_on_curve(
                action,
                "ld_pos_seq",
                state.dancer_pos_sequence_map[dancer_name],
            )

            action.name = f"selected_{current_obj_name}Action"
            old_obj.name = f"[1]selected_{current_obj_name}"

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    set_dopesheet_filter(f"pos_seq")
    set_dopesheet_collapse_all(True)

    return None


def add_pinned_ctrl_data(
    add_blank: bool,
    obj_name: str,
    index: int,
):
    if add_blank:
        add_obj("[2]blank", "blankAction", "CONTROL", "ld_fade_seq", [])

    dancer_obj = bpy.data.objects.get(obj_name)

    if dancer_obj:
        dancer_name = getattr(dancer_obj, "ld_dancer_name")

        add_obj(
            f"[{3 + index}]pinned_{dancer_name}",
            f"pinned_{dancer_name}Action",
            "CONTROL",
            "ld_fade_seq",
            state.dancer_fade_sequence_map[dancer_name],
        )


def add_pinned_pos_data(
    add_blank: bool,
    obj_name: str,
    index: int,
):
    if add_blank:
        add_obj("[2]blank", "blankAction", "POS", "ld_pos_seq", [])

    dancer_obj = bpy.data.objects.get(obj_name)

    if dancer_obj:
        dancer_name = getattr(dancer_obj, "ld_dancer_name")

        add_obj(
            f"[{3 + index}]pinned_{dancer_name}",
            f"pinned_{dancer_name}Action",
            "POS",
            "ld_pos_seq",
            state.dancer_pos_sequence_map[dancer_name],
        )


def handle_pinned_object():
    if not bpy.context:
        return

    if len(state.pinned_objects) >= 3:
        notify("INFO", "Maximum pinned objects reached")
        return

    obj = None
    if bpy.context.selected_objects:
        obj = bpy.context.selected_objects[0]

    if obj:
        dancer_name = getattr(obj, "ld_dancer_name")

        if dancer_name in state.pinned_objects:
            notify("INFO", f"{dancer_name} already pinned")

        else:
            add_blank = True if not state.pinned_objects else False
            state.pinned_objects.append(dancer_name)

            if state.editor == Editor.CONTROL_EDITOR:
                add_pinned_ctrl_data(
                    add_blank, dancer_name, len(state.pinned_objects) - 1
                )
            elif state.editor == Editor.POS_EDITOR:
                add_pinned_pos_data(
                    add_blank, dancer_name, len(state.pinned_objects) - 1
                )

            set_dopesheet_collapse_all(True)
            notify("INFO", f"{obj.name} pinned")

    return


def handle_delete_pinned_object(index: int):
    notify("INFO", f"{state.pinned_objects[index]} is unpinned")

    is_deleted = False
    for i, obj_name in enumerate(state.pinned_objects):
        if i == index:
            delete_obj(f"[{3 + i}]pinned_{obj_name}")
            is_deleted = True

        elif is_deleted:
            obj = bpy.data.objects.get(f"[{3 + i}]pinned_{obj_name}")
            if obj:
                obj.name = f"[{2 + i}]pinned_{obj_name}"

    state.pinned_objects.pop(index)

    if not state.pinned_objects:
        delete_obj("[2]blank")

    set_dopesheet_collapse_all(True)
    return


def clear_pinned_timeline():
    delete_obj("[2]blank")
    for i, obj_name in enumerate(state.pinned_objects):
        delete_obj(f"[{3 + i}]pinned_{obj_name}")
    state.pinned_objects = []


def clear_timeline(old_selected_obj_name: str):
    deselect_obj = bpy.data.objects.get(f"[1]selected_{old_selected_obj_name}")
    if deselect_obj:
        action = ensure_action(
            deselect_obj, f"[1]selected_{old_selected_obj_name}Action"
        )

        if state.editor == Editor.CONTROL_EDITOR:
            delete_curve(action, "fade_for_selected_object")
            set_dopesheet_filter("control_frame")

        elif state.editor == Editor.POS_EDITOR:
            delete_curve(action, "position_selected_dancer")
            set_dopesheet_filter("pos_frame")

        action.name = f"[1]selected_Action"
        deselect_obj.name = f"[1]selected_"

    set_dopesheet_collapse_all(True)

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    return None


def handle_timeline(
    obj: bpy.types.Object | None,
):
    state_current_name = state.current_selected_obj_name
    current_name = ""
    old_name = ""

    if obj:
        if state_current_name == obj.name:
            return None

        # set control frame
        if state.editor == Editor.CONTROL_EDITOR:
            current_name = get_effective_name(obj.name)

            if state_current_name:
                old_name = get_effective_name(state_current_name)

            state.current_selected_obj_name = obj.name
            reset_selected_ctrl_data(current_name, old_name)

        # set pos frame
        elif state.editor == Editor.POS_EDITOR:
            current_name = obj.name
            if state_current_name:
                old_name = state_current_name

            state.current_selected_obj_name = obj.name
            reset_selected_pos_data(current_name, old_name)

        notify("INFO", f"Current Selected: {obj.name}")
        return None

    else:
        if state_current_name:
            old_name = get_effective_name(state_current_name)
            state.current_selected_obj_name = None
            clear_timeline(old_name)
            return None

    return None


def register_handle_timeline(obj: bpy.types.Object | None):
    handle_task = partial(handle_timeline, obj)
    bpy.app.timers.register(handle_task)


def update_fade_seq_from_state():
    sorted_ctrl_map = sorted(
        state.control_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    sorted_frame_ctrl_map = [item[1].start for item in sorted_ctrl_map]

    """setup fade for control frame"""
    # fade sequence for fade_for_new_status (with parital load)
    frame_range_l, frame_range_r = state.dancer_load_frames

    (
        filtered_ctrl_map_start,
        filtered_ctrl_map_end,
        filtered_ctrl_map,
    ) = get_filtered_map_for_first_timeline(  # type: ignore
        frame_range_l, frame_range_r, sorted_ctrl_map, sorted_frame_ctrl_map, True
    )

    filtered_ctrl_map = cast(
        list[tuple[MapID, ControlMapElement_MODIFIED]], filtered_ctrl_map
    )

    overall_fade_seq = []
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
                overall_fade_seq.append(
                    (frame.start, frame.fade_for_new_status, KeyframeType.GENERATED)
                )
            else:
                overall_fade_seq.append(
                    (frame.start, frame.fade_for_new_status, KeyframeType.NORMAL)
                )

        else:
            overall_fade_seq.append(
                (frame.start, frame.fade_for_new_status, KeyframeType.BREAKDOWN)
            )

    state.overall_fade_sequence = overall_fade_seq

    """setup fade for each dancer"""
    dancer_fade_sequence = {}
    for dancer_name in state.dancer_names:
        # fade sequence for the selected part object (with parital load)
        filtered_ctrl_map = cast(
            list[tuple[MapID, ControlMapElement_MODIFIED]],
            get_filtered_map_for_second_timeline(
                frame_range_l,
                frame_range_r,
                filtered_ctrl_map_start,
                filtered_ctrl_map_end,
                sorted_ctrl_map,
                dancer_name,
                "CONTROL",
            ),
        )

        part_fade_seq = []
        for _, frame in filtered_ctrl_map:
            active_parts = [
                part for part in frame.status[dancer_name].values() if part is not None
            ]

            if active_parts:
                part_fade_seq.append(
                    (
                        frame.start,
                        any(part.fade for part in active_parts),
                        KeyframeType.NORMAL,
                    )
                )

        dancer_fade_sequence[dancer_name] = part_fade_seq

    state.dancer_fade_sequence_map = dancer_fade_sequence

    first_obj = bpy.data.objects.get("[0]control_frame")
    if not first_obj:
        add_obj(
            "[0]control_frame",
            "control_frameAction",
            "CONTROL",
            "ld_fade_seq",
            state.overall_fade_sequence,
        )

    else:
        action = ensure_action(first_obj, "control_frameAction")
        draw_fade_on_curve(action, "ld_fade_seq", state.overall_fade_sequence)


def update_pos_seq_from_state():
    sorted_pos_map = sorted(
        state.pos_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    sorted_frame_pos_map = [item[1].start for item in sorted_pos_map]

    """setup pos for pos frame"""
    # pos_map for pos frame (with partial load)
    frame_range_l, frame_range_r = state.dancer_load_frames
    (
        filtered_pos_map_start,
        filtered_pos_map_end,
        filtered_pos_map,
    ) = get_filtered_map_for_first_timeline(  # type: ignore
        frame_range_l, frame_range_r, sorted_pos_map, sorted_frame_pos_map, True
    )

    filtered_pos_map = cast(list[tuple[MapID, PosMapElement]], filtered_pos_map)

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

    state.overall_pos_sequence = pos_start_record

    """setup pos for selected dancer"""
    dancer_pos_seq = {}
    for dancer_name in state.dancer_names:
        # pos map for selected dancer (with partial load)
        filtered_pos_map = cast(
            list[tuple[MapID, PosMapElement]],
            get_filtered_map_for_second_timeline(
                frame_range_l,
                frame_range_r,
                filtered_pos_map_start,
                filtered_pos_map_end,
                sorted_pos_map,
                dancer_name,
                "POS",
            ),
        )

        dancer_pos_start_record = [
            (frame.start, KeyframeType.NORMAL)
            for _, frame in filtered_pos_map
            if frame.pos[dancer_name] is not None
        ]

        dancer_pos_seq[dancer_name] = dancer_pos_start_record

    state.dancer_pos_sequence_map = dancer_pos_seq

    first_obj = bpy.data.objects.get("[0]pos_frame")
    if not first_obj:
        add_obj(
            "[0]pos_frame",
            "pos_frameAction",
            "POS",
            "ld_pos_seq",
            state.overall_pos_sequence,
        )

    else:
        action = ensure_action(first_obj, "pos_frameAction")
        draw_pos_on_curve(action, "ld_pos_seq", state.overall_pos_sequence)


def setup_seq_map():
    update_fade_seq_from_state()
    update_pos_seq_from_state()
