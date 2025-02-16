import traceback
from typing import Any, Literal, cast

import bpy

from ....utils.ui import set_dopesheet_filter


# WARNING: This function will crash for now
# Ref: Issues on context override https://projects.blender.org/blender/blender/issues/114736
# -> May be fixed in the future
def close_area(screen: bpy.types.Screen, area_ui_type: str):
    if not bpy.context:
        return
    try:
        area = next(
            area
            for area in cast(list[bpy.types.Area], screen.areas)
            if area.ui_type == area_ui_type
        )

        ctx = cast(dict[str, Any], bpy.context.copy())
        ctx["screen"] = screen
        ctx["area"] = area
        ctx["region"] = area.regions[-1]

        with bpy.context.temp_override(**ctx):
            bpy.ops.screen.area_close()

    except StopIteration:
        pass


def split_area(
    screen: bpy.types.Screen,
    area_ui_type: str,
    direction: Literal["HORIZONTAL", "VERTICAL"],
    factor: float,
):
    if not bpy.context:
        return
    try:
        area = next(
            area
            for area in cast(list[bpy.types.Area], screen.areas)
            if area.ui_type == area_ui_type
        )

        ctx = cast(dict[str, Any], bpy.context.copy())
        ctx["screen"] = screen
        ctx["area"] = area
        ctx["region"] = area.regions[-1]

        with bpy.context.temp_override(**ctx):
            bpy.ops.screen.area_split(direction=direction, factor=factor)

    except StopIteration:
        traceback.print_exc()


def get_area(
    screen: bpy.types.Screen, area_ui_type: str, sort_by: str = "x", index: int = 0
) -> bpy.types.Area | None:
    areas = [
        area
        for area in cast(list[bpy.types.Area], screen.areas)
        if area.ui_type == area_ui_type
    ]

    if sort_by == "x":
        areas.sort(key=lambda area: area.x)
    elif sort_by == "y":
        areas.sort(key=lambda area: area.y)

    if index < 0 or index >= len(areas):
        return None

    return areas[index]


def setup_display():
    if not bpy.context:
        return
    screen = bpy.context.screen

    """
    Setup layout
    """
    # TODO: Fixed layout
    # split_area(screen, "VIEW_3D", "HORIZONTAL", 0.3)
    # timeline_area = get_area(screen, "VIEW_3D", "y", 0)
    # if timeline_area is None:
    #     return
    # timeline_area.ui_type = "TIMELINE"
    #
    # split_area(screen, "VIEW_3D", "VERTICAL", 0.8)
    # outliner_area = get_area(screen, "VIEW_3D", "x", 1)
    # if outliner_area is None:
    #     return
    # outliner_area.ui_type = "OUTLINER"

    """
    3d viewport
    """
    view_3d_area = get_area(screen, "VIEW_3D")
    if view_3d_area is None:
        return

    view_3d_area.show_menus = False

    space = cast(bpy.types.SpaceView3D, view_3d_area.spaces.active)

    space.overlay.show_relationship_lines = False
    space.overlay.show_cursor = False
    space.overlay.show_bones = False
    space.overlay.show_motion_paths = False
    space.overlay.show_object_origins = False
    space.overlay.show_extras = False
    # space.overlay.show_floor = False

    space.shading.background_type = "VIEWPORT"
    space.shading.background_color = (0, 0, 0)
    space.shading.color_type = "OBJECT"
    space.shading.light = "FLAT"
    space.shading.show_object_outline = False
    # space.shading.light = "STUDIO"
    # space.shading.studio_light = "paint.sl"

    space.show_region_ui = True
    # space.show_region_header = False
    space.show_region_toolbar = False
    space.show_region_tool_header = False

    """
    scene
    """
    bpy.context.scene.tool_settings.use_keyframe_insert_auto = False
    bpy.context.scene.show_keys_from_selected_only = False
    bpy.context.scene.sync_mode = "AUDIO_SYNC"

    """
    timeline
    """
    screen.use_follow = True

    timeline = get_area(screen, "TIMELINE")
    if timeline is None:
        return

    timeline.show_menus = False

    space = cast(bpy.types.SpaceDopeSheetEditor, timeline.spaces.active)

    space.show_seconds = False

    space.show_region_ui = True
    # space.show_region_header = False
    space.show_region_channels = False

    set_dopesheet_filter("control_frame")  # follow default editor

    """
    Outliner
    """
    outliner = get_area(screen, "OUTLINER")
    if outliner is None:
        return

    outliner.show_menus = False

    space = cast(bpy.types.SpaceOutliner, outliner.spaces.active)

    space.filter_state = "SELECTABLE"
    space.use_filter_collection = False
    space.use_filter_object_content = False
    space.use_sort_alpha = True

    space.show_restrict_column_hide = False
    space.show_restrict_column_enable = False
    space.show_restrict_column_select = False
    space.show_restrict_column_viewport = False
    space.show_restrict_column_render = False
    space.show_restrict_column_holdout = False
    space.show_restrict_column_indirect_only = False
