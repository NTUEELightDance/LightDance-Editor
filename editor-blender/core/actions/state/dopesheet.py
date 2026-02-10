"""
Docstring for editor-blender.core.actions.state.dopesheet

-This is a file for handling timeline display when 
-1. a dancer or part is selected
-2. a dancer or part is pinned
"""

from functools import partial
from typing import cast

import bpy

from ....core.models import (
    ControlMapElement_MODIFIED,
    Editor,
    FadeSequence,
    MapID,
    PosMapElement,
    PosSequence,
)
from ....core.states import state
from ....core.utils.algorithms import smallest_range_including_lr
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


def get_filtered_index_for_first_timeline(
    l_timerange: int,
    r_timerange: int,
    sorted_frame_map: list[int],
) -> tuple[int, int]:
    (start_index, end_index) = smallest_range_including_lr(
        sorted_frame_map, l_timerange, r_timerange
    )

    return start_index, end_index


def get_filtered_index_for_second_timeline(
    l_timerange: int,
    r_timerange: int,
    init_start_index: int,
    init_end_index: int,
    sorted_map: list[tuple[MapID, ControlMapElement_MODIFIED]]
    | list[tuple[MapID, PosMapElement]],
    dancer_name: str,
    map_type: str,
) -> tuple[int, int]:
    """
    The code below filters the smallest range in a sorted_map that satisfies the 3 following conditions:
    1. [state.dancer_load_frames[0], state.dancer_load_frames[1]] is included
    2. The borders' frame.start aren't state.dancer_load_frames[0] or state.dancer_load_frames[1]
    3. The status of the borders' frames aren't None
    """

    start_index = init_start_index
    end_index = init_end_index
    l_index = init_start_index
    r_index = init_end_index

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

    if not (
        sorted_map[init_start_index][1].start != l_timerange
        and has_status(sorted_map[init_start_index][1])
    ):
        while True:
            if l_index == 0:
                break

            l_index -= 1

            if has_status(sorted_map[l_index][1]):
                start_index = l_index
                break

    if not (
        sorted_map[init_end_index][1].start != r_timerange
        and has_status(sorted_map[init_end_index][1])
    ):
        while True:
            if r_index == len(sorted_map) - 1:
                break

            r_index += 1

            if has_status(sorted_map[r_index][1]):
                end_index = r_index
                break

    return start_index, end_index


def reset_selected_ctrl_data(current_obj_name: str, old_selected_obj_name: str):
    current_obj = bpy.data.objects.get(current_obj_name)
    old_obj = bpy.data.objects.get(f"[1]selected_{old_selected_obj_name}")

    if current_obj:
        dancer_name = getattr(current_obj, "ld_dancer_name")
        fade_seq = sorted(
            [seq for seq in state.fade_sequence_map[dancer_name].values()],
            key=lambda x: x[0],
        )

        if not old_obj:
            add_obj(
                f"[1]selected_{current_obj_name}",
                f"selected_{current_obj_name}Action",
                "CONTROL",
                "ld_fade_seq",
                fade_seq,
            )

        else:
            action = ensure_action(old_obj, f"selected_{old_selected_obj_name}Action")
            draw_fade_on_curve(
                action,
                "ld_fade_seq",
                fade_seq,
            )

            action.name = f"selected_{current_obj_name}Action"
            old_obj.name = f"[1]selected_{current_obj_name}"

        overall = state.fade_load_frames["Overall"]

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    set_dopesheet_filter(f"fade_seq")
    set_dopesheet_collapse_all(True)

    return


def reset_selected_pos_data(current_obj_name: str, old_selected_obj_name: str):
    old_obj = bpy.data.objects.get(f"[1]selected_{old_selected_obj_name}")
    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj:
        dancer_name = getattr(current_obj, "ld_dancer_name")
        pos_seq = sorted(
            [seq for seq in state.pos_sequence_map[dancer_name].values()],
            key=lambda x: x[0],
        )

        if not old_obj:
            add_obj(
                f"[1]selected_{current_obj_name}",
                f"selected_{current_obj_name}Action",
                "POS",
                "ld_pos_seq",
                pos_seq,
            )

        else:
            action = ensure_action(old_obj, f"selected_{old_selected_obj_name}Action")
            draw_pos_on_curve(
                action,
                "ld_pos_seq",
                pos_seq,
            )

            action.name = f"selected_{current_obj_name}Action"
            old_obj.name = f"[1]selected_{current_obj_name}"

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    set_dopesheet_filter(f"pos_seq")
    set_dopesheet_collapse_all(True)

    return


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
        fade_seq = sorted(
            [seq for seq in state.fade_sequence_map[dancer_name].values()],
            key=lambda x: x[0],
        )

        add_obj(
            f"[{3 + index}]pinned_{dancer_name}",
            f"pinned_{dancer_name}Action",
            "CONTROL",
            "ld_fade_seq",
            fade_seq,
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
        pos_seq = sorted(
            [seq for seq in state.pos_sequence_map[dancer_name].values()],
            key=lambda x: x[0],
        )

        add_obj(
            f"[{3 + index}]pinned_{dancer_name}",
            f"pinned_{dancer_name}Action",
            "POS",
            "ld_pos_seq",
            pos_seq,
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
    return


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


def get_load_range(
    sorted_map: list[tuple[MapID, ControlMapElement_MODIFIED]]
    | list[tuple[MapID, PosMapElement]],
    filtered_start_index: int,
    filtered_end_index: int,
    selected_start_time: int,
    selected_end_time: int,
) -> tuple[int, int]:
    filtered_start_time = sorted_map[filtered_start_index][1].start
    filtered_end_time = sorted_map[filtered_end_index][1].start

    load_start_time = min(filtered_start_time, selected_start_time)
    load_end_time = max(filtered_end_time, selected_end_time)

    return load_start_time, load_end_time


def get_overall_fade_seq_for_frame(
    frame: ControlMapElement_MODIFIED,
) -> tuple[int, bool, KeyframeType]:
    keyframe_type = KeyframeType.GENERATED
    active_dancers = [
        dancer
        for dancer, parts in frame.status.items()
        if any(part is not None for part in parts.values())
    ]

    if active_dancers:
        is_breakdown = all(
            not state.show_dancers[state.dancer_names.index(dancer)]
            for dancer in active_dancers
        )

        if is_breakdown:
            keyframe_type = KeyframeType.BREAKDOWN
        else:
            keyframe_type = KeyframeType.NORMAL

    return frame.start, frame.fade_for_new_status, keyframe_type


def get_overall_pos_seq_for_frame(frame: PosMapElement) -> tuple[int, KeyframeType]:
    keyframe_type = KeyframeType.BREAKDOWN
    active_dancers = [dancer for dancer, pos in frame.pos.items() if pos is not None]
    if active_dancers:
        is_generated = all(
            not state.show_dancers[state.dancer_names.index(dancer)]
            for dancer in active_dancers
        )

        if is_generated:
            keyframe_type = KeyframeType.GENERATED
        else:
            keyframe_type = KeyframeType.NORMAL

    return frame.start, keyframe_type


def init_fade_seq_from_state():
    sorted_ctrl_map = sorted(
        state.control_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    sorted_frame_ctrl_map = [item[1].start for item in sorted_ctrl_map]

    if sorted_ctrl_map:
        """setup fade for control frame"""
        # fade sequence for fade_for_new_status (with parital load)
        selected_start_time, selected_end_time = state.dancer_load_frames

        (
            filtered_start_index,
            filtered_end_index,
        ) = get_filtered_index_for_first_timeline(
            selected_start_time,
            selected_end_time,
            sorted_frame_ctrl_map,
        )

        overall_fade_seq: FadeSequence = {}
        for id, frame in sorted_ctrl_map[filtered_start_index : filtered_end_index + 1]:
            overall_fade_seq[id] = get_overall_fade_seq_for_frame(frame)

        sorted_overall_fade_seq_list = sorted(
            [seq for seq in overall_fade_seq.values()], key=lambda x: x[0]
        )

        first_obj = bpy.data.objects.get("[0]control_frame")
        if not first_obj:
            add_obj(
                "[0]control_frame",
                "control_frameAction",
                "CONTROL",
                "ld_fade_seq",
                sorted_overall_fade_seq_list,
            )

        else:
            action = ensure_action(first_obj, "control_frameAction")
            draw_fade_on_curve(action, "ld_fade_seq", sorted_overall_fade_seq_list)

        state.fade_sequence_map["Overall"] = overall_fade_seq
        state.fade_load_frames["Overall"] = get_load_range(
            sorted_ctrl_map,
            filtered_start_index,
            filtered_end_index,
            selected_start_time,
            selected_end_time,
        )

        """setup fade for each dancer"""
        for dancer_name in state.dancer_names:
            # fade sequence for the selected part object (with parital load)
            (
                dancer_filtered_start_index,
                dancer_filtered_end_index,
            ) = cast(
                tuple[int, int],
                get_filtered_index_for_second_timeline(
                    selected_start_time,
                    selected_end_time,
                    filtered_start_index,
                    filtered_end_index,
                    sorted_ctrl_map,
                    dancer_name,
                    "CONTROL",
                ),
            )

            dancer_fade_seq = {}
            for id, frame in sorted_ctrl_map[
                dancer_filtered_start_index : dancer_filtered_end_index + 1
            ]:
                active_parts = [
                    part
                    for part in frame.status[dancer_name].values()
                    if part is not None
                ]

                if active_parts:
                    dancer_fade_seq[id] = (
                        frame.start,
                        any(part.fade for part in active_parts),
                        KeyframeType.NORMAL,
                    )

            state.fade_sequence_map[dancer_name] = dancer_fade_seq
            state.fade_load_frames[dancer_name] = get_load_range(
                sorted_ctrl_map,
                dancer_filtered_start_index,
                dancer_filtered_end_index,
                selected_start_time,
                selected_end_time,
            )


def init_pos_seq_from_state():
    sorted_pos_map = sorted(
        state.pos_map_MODIFIED.items(), key=lambda item: item[1].start
    )
    sorted_frame_pos_map = [item[1].start for item in sorted_pos_map]

    if sorted_pos_map:
        """setup pos for pos frame"""
        # pos_map for pos frame (with partial load)
        selected_start_time, selected_end_time = state.dancer_load_frames
        (
            filtered_start_index,
            filtered_end_index,
        ) = get_filtered_index_for_first_timeline(
            selected_start_time, selected_end_time, sorted_frame_pos_map
        )

        pos_start_record: PosSequence = {}
        for id, frame in sorted_pos_map[filtered_start_index : filtered_end_index + 1]:
            pos_start_record[id] = get_overall_pos_seq_for_frame(frame)

        sorted_pos_start_record_list = sorted(
            [seq for seq in pos_start_record.values()], key=lambda x: x[0]
        )

        first_obj = bpy.data.objects.get("[0]pos_frame")
        if not first_obj:
            add_obj(
                "[0]pos_frame",
                "pos_frameAction",
                "POS",
                "ld_pos_seq",
                sorted_pos_start_record_list,
            )

        else:
            action = ensure_action(first_obj, "pos_frameAction")
            draw_pos_on_curve(action, "ld_pos_seq", sorted_pos_start_record_list)

        state.pos_sequence_map["Overall"] = pos_start_record
        state.fade_load_frames["Overall"] = get_load_range(
            sorted_pos_map,
            filtered_start_index,
            filtered_end_index,
            selected_start_time,
            selected_end_time,
        )

        """setup pos for selected dancer"""
        for dancer_name in state.dancer_names:
            # pos map for selected dancer (with partial load)
            (
                dancer_filtered_start_index,
                dancer_filtered_end_index,
            ) = cast(
                tuple[int, int],
                get_filtered_index_for_second_timeline(
                    selected_start_time,
                    selected_end_time,
                    filtered_start_index,
                    filtered_end_index,
                    sorted_pos_map,
                    dancer_name,
                    "POS",
                ),
            )

            dancer_pos_start_record = {}
            for id, frame in sorted_pos_map[
                dancer_filtered_start_index : dancer_filtered_end_index + 1
            ]:
                if frame.pos[dancer_name] is not None:
                    dancer_pos_start_record[id] = (frame.start, KeyframeType.NORMAL)

            state.pos_sequence_map[dancer_name] = dancer_pos_start_record
            state.pos_load_frames[dancer_name] = get_load_range(
                sorted_pos_map,
                dancer_filtered_start_index,
                dancer_filtered_end_index,
                selected_start_time,
                selected_end_time,
            )


def setup_seq_map():
    init_fade_seq_from_state()
    init_pos_seq_from_state()


def update_fade_seq():
    # init_fade_seq_from_state()

    """Can pass in these params from the func apply_control_map_updates() for state.control_map_updates_MODIFIED after it is implemented"""
    control_map_updates = state.control_map_updates_MODIFIED
    updated = sorted(
        [
            (start, id, frame)
            for id, (start, frame) in control_map_updates.updated.items()
            if id not in state.not_loaded_control_frames
        ],
        key=lambda x: x[0],
    )
    added = sorted(
        [
            (id, frame)
            for id, frame in control_map_updates.added.items()
            if id not in state.not_loaded_control_frames
        ],
        key=lambda x: x[1].start,
    )
    deleted = sorted(
        [(start, id) for id, start in control_map_updates.deleted.items()],
        key=lambda x: x[0],
    )

    fade_seq_map = state.fade_sequence_map

    for _, id, frame in updated:
        for name, fade_seq in fade_seq_map.items():
            if name == "Overall":
                fade_seq[id] = get_overall_fade_seq_for_frame(frame)

            else:
                active_parts = [
                    part for part in frame.status[name].values() if part is not None
                ]

                if active_parts:
                    fade_seq[id] = (
                        frame.start,
                        any(part.fade for part in active_parts),
                        KeyframeType.NORMAL,
                    )

    for id, frame in added:
        for name, fade_seq in fade_seq_map.items():
            if name == "Overall":
                fade_seq[id] = get_overall_fade_seq_for_frame(frame)

            else:
                active_parts = [
                    part for part in frame.status[name].values() if part is not None
                ]

                if active_parts:
                    fade_seq[id] = (
                        frame.start,
                        any(part.fade for part in active_parts),
                        KeyframeType.NORMAL,
                    )

    for _, id in deleted:
        for fade_seq in fade_seq_map.values():
            fade_seq.pop(id, None)

    return


def update_pos_seq(
    updated: list[tuple[int, MapID, PosMapElement]],
    added: list[tuple[MapID, PosMapElement]],
    deleted: list[tuple[int, MapID]],
):
    pos_seq_map = state.pos_sequence_map

    for _, id, frame in updated:
        for name, pos_seq in pos_seq_map.items():
            if name == "Overall":
                pos_seq[id] = get_overall_pos_seq_for_frame(frame)

            else:
                if frame.pos[name] is not None:
                    pos_seq[id] = (frame.start, KeyframeType.NORMAL)

    for id, frame in added:
        for name, pos_seq in pos_seq_map.items():
            if name == "Overall":
                pos_seq[id] = get_overall_pos_seq_for_frame(frame)

            else:
                if frame.pos[name] is not None:
                    pos_seq[id] = (frame.start, KeyframeType.NORMAL)

    for _, id in deleted:
        for pos_seq in pos_seq_map.values():
            pos_seq.pop(id, None)

    return
