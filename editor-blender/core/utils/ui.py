import bpy


def redraw_area(area_type: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == area_type:  # type: ignore
            area.tag_redraw()  # type: ignore


def set_dopesheet_filter(content: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == "DOPESHEET_EDITOR":  # type: ignore
            area.spaces[0].dopesheet.filter_text = content  # type: ignore
