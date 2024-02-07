from typing import Set

import bpy


def redraw_area(area_types: Set[str]):
    if bpy.context.screen is None:  # type: ignore
        return

    for area in bpy.context.screen.areas:  # type: ignore
        if area.type in area_types:  # type: ignore
            area.tag_redraw()  # type: ignore


def set_dopesheet_filter(content: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "DOPESHEET_EDITOR":  # type: ignore
            area.spaces[0].dopesheet.filter_text = content  # type: ignore


def set_outliner_filter(content: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].filter_text = content  # type: ignore


def set_outliner_focus_led(part_name: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].filter_text = part_name  # type: ignore
            area.spaces[0].use_filter_object_empty = False  # type: ignore


def unset_outliner_focus_led():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].filter_text = ""  # type: ignore
            area.spaces[0].use_filter_object_empty = True  # type: ignore


def set_outliner_hide_mesh():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].use_filter_object_mesh = False  # type: ignore


def unset_outliner_hide_mesh():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].use_filter_object_mesh = True  # type: ignore


def set_outliner_hide_empty():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].use_filter_object_empty = False  # type: ignore


def unset_outliner_hide_empty():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].use_filter_object_empty = True  # type: ignore


def set_outliner_hide_mode_column():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].show_mode_column = False  # type: ignore


def unset_outliner_hide_mode_column():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            area.spaces[0].show_mode_column = True  # type: ignore


def outliner_hide_one_level():
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "OUTLINER":  # type: ignore
            region = area.regions[0]  # type: ignore
            override = bpy.context.copy()
            override["area"] = area  # type: ignore
            override["region"] = region  # type: ignore
            with bpy.context.temp_override(**override):  # type: ignore
                bpy.ops.outliner.show_one_level(open=False)
