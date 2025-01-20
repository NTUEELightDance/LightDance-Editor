import traceback
from typing import Any, cast

import blf
import bpy
from bpy_extras.view3d_utils import location_3d_to_region_2d
from mathutils import Vector

from ..core.states import state
from ..core.utils.ui import redraw_area
from ..storage import get_storage


class NameTagSettings:
    def __init__(self):
        self.x_offset: float = 0
        self.y_offset: float = 0
        self.z_offset: float = 2.3
        self.fontsize: int = 25
        self.text_rgba: tuple[float, float, float, float] = (1, 1, 1, 1)
        self.font_id: int = 0
        self.name_tag_handle: Any = None
        self.name_tag_draw: Any = None
        self.region: bpy.types.Region | None = None


name_tag_settings = NameTagSettings()


def name_tag_draw():
    global name_tag_settings

    if not getattr(get_storage("preferences"), "show_nametag"):
        return

    data_objects = cast(dict[str, bpy.types.Object], bpy.data.objects)

    blf.size(name_tag_settings.font_id, name_tag_settings.fontsize)
    blf.color(name_tag_settings.font_id, *name_tag_settings.text_rgba)
    if name_tag_settings.region:
        region = name_tag_settings.region
        region_data = cast(bpy.types.RegionView3D, region.data)
    else:
        return
    if state.local_view:
        return

    dancer_names = state.dancer_names
    for name in dancer_names:
        try:
            dancer_obj = data_objects.get(name)
            if dancer_obj is None:
                continue

            dancer_location = dancer_obj.location
            text_location_3d = Vector(
                (
                    dancer_location[0] + name_tag_settings.x_offset,
                    dancer_location[1] + name_tag_settings.y_offset,
                    dancer_location[2] + name_tag_settings.z_offset,
                )
            )
            text_view_2d = location_3d_to_region_2d(
                region, region_data, text_location_3d
            )
            if not text_view_2d:
                continue
            text_w, text_h = cast(
                tuple[float, float], blf.dimensions(name_tag_settings.font_id, name)
            )
            blf.position(
                name_tag_settings.font_id,
                text_view_2d[0] - text_w / 2,
                text_view_2d[1] - text_h / 2,
                0,
            )
            blf.draw(name_tag_settings.font_id, name)

        except AttributeError:
            traceback.print_exc()

        except TypeError:
            traceback.print_exc()


def name_tag_handler():
    global name_tag_settings
    if name_tag_settings.name_tag_draw is not None:
        bpy.types.SpaceView3D.draw_handler_remove(
            name_tag_settings.name_tag_handle, "WINDOW"
        )
    name_tag_settings.name_tag_draw = bpy.types.SpaceView3D.draw_handler_add(
        name_tag_draw, (), "WINDOW", "POST_PIXEL"
    )


def mount():
    global name_tag_settings
    screen = cast(bpy.types.Screen, bpy.data.screens["Layout"])
    area = next(
        area
        for area in cast(list[bpy.types.Area], screen.areas)
        if area.type == "VIEW_3D"
    )
    region = next(
        region
        for region in cast(list[bpy.types.Region], area.regions)
        if region.type == "WINDOW"
    )
    name_tag_settings.region = region
    name_tag_settings.name_tag_handle = bpy.types.SpaceView3D.draw_handler_add(
        name_tag_handler, (), "WINDOW", "POST_PIXEL"
    )
    print("Name tag mounted")
    redraw_area({"VIEW_3D"})


def unmount():
    global name_tag_settings
    try:
        if name_tag_settings.name_tag_handle is not None:
            bpy.types.SpaceView3D.draw_handler_remove(
                name_tag_settings.name_tag_handle, "WINDOW"
            )
            name_tag_settings.name_tag_handle = None
    except:
        pass
