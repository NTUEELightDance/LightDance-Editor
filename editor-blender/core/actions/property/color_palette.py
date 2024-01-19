import bpy

from ....properties.types import ColorPaletteItemType
from ...utils.convert import float_to_rgb, rgb_to_float


def update_color_rgb(self: ColorPaletteItemType, context: bpy.types.Context):
    modified_color_float = tuple(self.color_float)
    color_float = rgb_to_float(self.color_rgb)
    if modified_color_float != color_float:
        self["color_float"] = color_float  # type: ignore


def update_color_float(self: ColorPaletteItemType, context: bpy.types.Context):
    modified_color_rgb = tuple(self.color_rgb)
    color_rgb = float_to_rgb(self.color_float)
    if modified_color_rgb != color_rgb:
        self["color_rgb"] = color_rgb  # type: ignore


def lock_color_float(self: ColorPaletteItemType, context: bpy.types.Context):
    modified_color_float = tuple(self.color_float)
    color_float = rgb_to_float(self.color_rgb)
    if modified_color_float != color_float:
        self["color_float"] = color_float  # type: ignore
