import bpy


def redraw_area(area_type: str):
    for area in bpy.context.screen.areas:  # type: ignore
        if area.type == area_type:  # type: ignore
            area.tag_redraw()  # type: ignore
