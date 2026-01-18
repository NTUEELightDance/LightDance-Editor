from functools import partial

import bpy

from ....core.models import Editor, SelectMode
from ....core.states import state
from ....properties.types import ObjectType
from ...utils.notification import notify
from ...utils.ui import redraw_area, set_dopesheet_collapse_all, set_dopesheet_filter
from ..property.animation_data.utils import (
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


def draw_fade_on_curve(
    action: bpy.types.Action, data_path: str, fade_seq: list[tuple[int, bool]]
):
    total_effective_ctrl_frame_number = len(fade_seq)
    curve = ensure_curve(
        action,
        data_path,
        keyframe_points=total_effective_ctrl_frame_number,
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)

    for i, (start, _) in enumerate(fade_seq):
        point = kpoints_list[i]
        point.co = start, start

        if i > 0 and fade_seq[i - 1][1]:
            point.co = start, kpoints_list[i - 1].co[1]

        point.interpolation = "CONSTANT"
        point.select_control_point = False


def draw_pos_on_curve(action: bpy.types.Action, data_path: str, pos_seq: list[int]):
    total_effective_pos_frame_number = len(pos_seq)
    curve = ensure_curve(
        action,
        data_path,
        keyframe_points=total_effective_pos_frame_number,
        clear=True,
    )

    _, kpoints_list = get_keyframe_points(curve)

    for i, start in enumerate(pos_seq):
        point = kpoints_list[i]
        point.co = start, start

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

        dancer_name = getattr(current_obj, "ld_dancer_name")
        part_name = getattr(current_obj, "ld_part_name")

        # setup fade for control frame
        ctrl_obj = bpy.data.objects.new("control_frame", None)

        if ctrl_obj.animation_data is None:
            ctrl_obj.animation_data_create()

        action_name = f"{ctrl_obj.name}Action"
        ctrl_action = ensure_action(ctrl_obj, action_name)

        # fade sequence for fade_for_new_status
        dancer_fade_seq = [
            (frame.start, frame.fade_for_new_status)  # type:ignore
            for _, frame in sorted_ctrl_map
        ]

        draw_fade_on_curve(ctrl_action, "fade_for_new_status", dancer_fade_seq)

        # setup fade for selected part object
        selected_part = bpy.data.objects.new(f"selected_{current_obj_name}", None)
        if selected_part.animation_data is None:
            selected_part.animation_data_create()

        selected_action = ensure_action(
            selected_part, f"selected_{current_obj_name}Action"
        )

        # fade sequence for the selected part object
        part_fade_seq = [
            (frame.start, frame.status[dancer_name][part_name].fade)  # type:ignore
            for _, frame in sorted_ctrl_map
            if frame.status[dancer_name][part_name] is not None
        ]

        # sorted_ctrl_map = sorted(state.control_map.items(), key=lambda item: item[1].start)
        # filtered_ctrl_map = [
        #     ctrl_item
        #     for ctrl_item in sorted_ctrl_map
        #     if ctrl_item[0] not in state.not_loaded_control_frames
        # ]
        # fade_seq = [(frame.start, frame.fade) for _, frame in filtered_ctrl_map]

        draw_fade_on_curve(selected_action, "fade_for_selected_object", part_fade_seq)

        ctrl_obj.select_set(False)
        selected_part.select_set(False)
        bpy.context.collection.objects.link(ctrl_obj)
        bpy.context.collection.objects.link(selected_part)
        # notify("INFO", f"Added {ctrl_obj.name}")
        # notify("INFO", f"Added {selected_part.name}")

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    set_dopesheet_filter(f"fade")
    set_dopesheet_collapse_all(True)

    return None


def update_pos_data(current_obj_name: str, old_selected_obj_name: str):
    delete_obj("pos_frame")
    delete_obj(f"selected_{old_selected_obj_name}")
    current_obj = bpy.data.objects.get(current_obj_name)

    if current_obj:
        dancer_name = getattr(current_obj, "ld_dancer_name")

        # setup pos for pos frame
        pos_obj = bpy.data.objects.new("pos_frame", None)

        if pos_obj.animation_data is None:
            pos_obj.animation_data_create()

        action_name = f"{pos_obj.name}Action"
        pos_action = ensure_action(pos_obj, action_name)
        pos_start_record = [frame.start for _, frame in state.pos_map_MODIFIED.items()]

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

        dancer_pos_start_record = [
            frame.start
            for _, frame in state.pos_map_MODIFIED.items()
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
        # notify("INFO", f"Added {pos_obj.name}")
        # notify("INFO", f"Added {selected_dancer.name}")

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
        # notify("INFO", f"Old selected obj is {old_name}")
        return

    else:
        if state_current_name:
            old_name = get_effective_name(state_current_name)
            state.current_selected_obj_name = None
            deselect_task = partial(deselect_timeline, old_name)
            bpy.app.timers.register(deselect_task)
            return

    return
