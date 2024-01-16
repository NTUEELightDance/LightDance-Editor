import bpy

from ....handlers.owner import msgbus_owner
from ...models import ColorMap
from ...utils.convert import float_to_rgb, rgb_to_float


def lock_color_float_change(item):
    setattr(item, "color_float", rgb_to_float(item.color_rgb))


def lock_color_rgb_change(item):
    setattr(item, "color_rgb", float_to_rgb(item.color_float))
    item.color_rgb = float_to_rgb(item.color_float)


def setup_color_data_from_state(colormap: ColorMap):
    getattr(bpy.context.window_manager, "ld_color_palette").clear()
    for id, color in colormap.items():
        item = getattr(bpy.context.window_manager, "ld_color_palette").add()
        item.color_id = id
        item.color_name = color.name
        item.color_rgb = color.rgb
        item.color_float = rgb_to_float(color.rgb)
        item.color_alpha = 1.0
        item.color_code = color.color_code
        bpy.msgbus.subscribe_rna(
            key=(item.color_float),
            owner=msgbus_owner,
            args=tuple([item]),
            notify=lock_color_float_change,
        )

    color_temp_item = getattr(bpy.context.window_manager, "ld_color_palette_temp")[0]
    setattr(color_temp_item, "color_rgb", [0, 0, 0])
    setattr(
        color_temp_item, "color_float", [x / 255 for x in color_temp_item.color_rgb]
    )
    setattr(color_temp_item, "color_name", "")
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_float),
        owner=msgbus_owner,
        args=tuple([color_temp_item]),
        notify=lock_color_rgb_change,
    )
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_rgb),
        owner=msgbus_owner,
        args=tuple([color_temp_item]),
        notify=lock_color_float_change,
    )
