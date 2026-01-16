from functools import partial

import bpy

from ...utils.notification import notify
from ...utils.ui import redraw_area, set_dopesheet_filter
from ..property.animation_data.utils import ensure_action, ensure_curve


def delete_and_data(current_obj_name: str, old_selected_obj_name: str):
    old_selected_obj = bpy.data.objects.get(f"Selected_{old_selected_obj_name}")
    if old_selected_obj:
        bpy.data.objects.remove(old_selected_obj)
        notify("INFO", f"Removed Selected_{old_selected_obj_name}")

    current_obj = bpy.data.objects.get(current_obj_name)
    if current_obj and current_obj.animation_data.action:
        selected_obj = bpy.data.objects.new(f"Selected_{current_obj.name}", None)
        if selected_obj.animation_data is None:
            selected_obj.animation_data_create()

        action_name = f"Selected_{current_obj.animation_data.action.name}"
        action = ensure_action(selected_obj, action_name)
        data_colors = ["r_color", "g_color", "b_color"]

        for fcurve in current_obj.animation_data.action.fcurves:
            notify("INFO", f"Copying FCurve {data_colors[fcurve.array_index]}")
            curve = ensure_curve(
                action,
                f"selected_{data_colors[fcurve.array_index]}",
                keyframe_points=len(fcurve.keyframe_points),
                clear=True,
            )
            for i, point in enumerate(fcurve.keyframe_points):
                new_point = curve.keyframe_points[i]
                new_point.co = point.co
                new_point.interpolation = point.interpolation
                new_point.select_control_point = False

        bpy.context.collection.objects.link(selected_obj)
        notify("INFO", f"Copied {current_obj.name} to {selected_obj.name}")

    redraw_area({"VIEW_3D", "DOPESHEET_EDITOR"})
    set_dopesheet_filter(f"Selected_")
    return None


def handle_select_timeline(current_obj_name: str, old_selected_obj_name: str | None):
    handle_data_task = partial(delete_and_data, current_obj_name, old_selected_obj_name)
    bpy.app.timers.register(handle_data_task)

    return
