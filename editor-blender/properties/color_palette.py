import bpy

from ..core.actions.state.color_palette import (
    lock_color_float_change,
    lock_color_rgb_change,
)


class ColorPaletteItem(bpy.types.PropertyGroup):
    color_id: bpy.props.IntProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(default=(0, 0, 0), min=0, max=1, subtype="COLOR", get=lambda s: s["color_float"], set=lambda s, c: None)  # type: ignore
    color_rgb: bpy.props.IntVectorProperty(default=(0, 0, 0), min=0, max=255)  # type: ignore
    color_alpha: bpy.props.FloatProperty(default=1, min=0, max=1)  # type: ignore
    color_code: bpy.props.StringProperty()  # type: ignore


class ColorPaletteTempItem(bpy.types.PropertyGroup):
    color_id: bpy.props.IntProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(default=(0, 0, 0), min=0, max=1, subtype="COLOR", update=lock_color_rgb_change)  # type: ignore
    color_rgb: bpy.props.IntVectorProperty(default=(0, 0, 0), min=0, max=255, update=lock_color_float_change)  # type: ignore
    color_alpha: bpy.props.FloatProperty(default=1, min=0, max=1)  # type: ignore
    color_code: bpy.props.StringProperty()  # type: ignore


def register():
    bpy.utils.register_class(ColorPaletteItem)
    bpy.utils.register_class(ColorPaletteTempItem)
    setattr(
        bpy.types.WindowManager,
        "ld_color_palette",
        bpy.props.CollectionProperty(type=ColorPaletteItem),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_color_palette_temp",
        bpy.props.PointerProperty(type=ColorPaletteTempItem),
    )


def unregister():
    delattr(bpy.types.WindowManager, "ld_color_palette")
    delattr(bpy.types.WindowManager, "ld_color_palette_temp")
    bpy.utils.unregister_class(ColorPaletteItem)
