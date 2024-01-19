import bpy

from ....properties.types import ColorPaletteItemType
from ...utils.convert import float_to_rgb, rgb_to_float


def update_color_rgb(item: ColorPaletteItemType, context: bpy.types.Context):
    color_float = tuple(item.color_float)
    new_float = rgb_to_float(item.color_rgb)
    if color_float != new_float:
        setattr(item, "color_float", new_float)


def update_color_float(item: ColorPaletteItemType, context: bpy.types.Context):
    color_rgb = tuple(item.color_rgb)
    new_rgb = float_to_rgb(item.color_float)
    if color_rgb != new_rgb:
        setattr(item, "color_rgb", new_rgb)


def lock_color_float(item: ColorPaletteItemType, context: bpy.types.Context):
    modified_color_float = tuple(item.color_float)
    color_float = rgb_to_float(item.color_rgb)
    if modified_color_float != color_float:
        setattr(item, "color_float", color_float)
