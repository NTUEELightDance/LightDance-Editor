from functools import partial

import bpy

from ....core.models import Editor
from ....core.states import state
from ....properties.types import LightType, ObjectType
from ...utils.notification import notify
from ...utils.ui import redraw_area, set_dopesheet_collapse_all, set_dopesheet_filter
from ..property.animation_data.utils import (
    ensure_action,
    ensure_curve,
    get_keyframe_points,
)


def delete_and_copy_ctrl_data(
    current_obj_name: str, old_selected_obj_name: str, select: bool
):
    old_selected_obj = bpy.data.objects.get(f"Selected_{old_selected_obj_name}")
    if old_selected_obj:
        bpy.data.objects.remove(old_selected_obj)
        notify("INFO", f"Removed Selected_{old_selected_obj_name}")

    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj:
        selected_obj = bpy.data.objects.new(f"Selected_{current_obj.name}", None)
        if selected_obj.animation_data is None:
            selected_obj.animation_data_create()

        action_name = f"Selected_{current_obj.animation_data.action.name}"
        action = ensure_action(selected_obj, action_name)

        dancer_name = getattr(current_obj, "ld_dancer_name")
        part_name = getattr(current_obj, "ld_part_name")

        sorted_ctrl_map = sorted(
            state.control_map_MODIFIED.items(), key=lambda item: item[1].start
        )
        fade_seq = [
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

        total_effective_ctrl_frame_number = len(fade_seq)
        curve = ensure_curve(
            action,
            "selected_object_fade",
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

        selected_obj.select_set(False)
        bpy.context.collection.objects.link(selected_obj)
        notify("INFO", f"Copied {current_obj.name} to {selected_obj.name}")

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})

    if select:
        set_dopesheet_filter(f"Selected_")
        set_dopesheet_collapse_all(True)
    else:
        set_dopesheet_filter("control_frame")
        set_dopesheet_collapse_all(False)
    return None


def get_effective_name(name: str) -> str:
    if name.endswith("_LED"):
        return f"{name}.000"
    return name


def handle_select_timeline(
    obj: bpy.types.Object | None,
):
    if state.editor == Editor.CONTROL_EDITOR:
        is_valid_selection = False
        current_name = ""
        old_name = ""

        if obj:
            ld_object_type = getattr(obj, "ld_object_type")

            if (
                ld_object_type == ObjectType.LIGHT.value
                and state.current_selected_obj_name != obj.name
            ):
                current_name = get_effective_name(obj.name)

                if state.current_selected_obj_name:
                    old_name = get_effective_name(state.current_selected_obj_name)

                state.current_selected_obj_name = obj.name
                is_valid_selection = True

        else:
            if state.current_selected_obj_name:
                old_name = get_effective_name(state.current_selected_obj_name)
                state.current_selected_obj_name = None
                is_valid_selection = True

        if is_valid_selection:
            notify("INFO", f"Current selected obj is {current_name}")
            notify("INFO", f"Old selected obj is {old_name}")
            handle_data_task = partial(
                delete_and_copy_ctrl_data, current_name, old_name, bool(obj)
            )
            bpy.app.timers.register(handle_data_task)

    return
