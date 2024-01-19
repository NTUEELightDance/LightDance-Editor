import bpy

from ..core.actions.property.color_palette import (
    lock_color_float,
    update_color_float,
    update_color_rgb,
)


class ColorPaletteItem(bpy.types.PropertyGroup):
    color_id: bpy.props.IntProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(  # type: ignore
        default=(0, 0, 0), min=0, max=1, subtype="COLOR", update=lock_color_float
    )
    color_rgb: bpy.props.IntVectorProperty(default=(0, 0, 0), min=0, max=255)  # type: ignore
    color_alpha: bpy.props.FloatProperty(default=1, min=0, max=1)  # type: ignore
    color_code: bpy.props.StringProperty()  # type: ignore


class ColorPaletteTempItem(bpy.types.PropertyGroup):
    color_id: bpy.props.IntProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(  # type: ignore
        default=(0, 0, 0), min=0, max=1, subtype="COLOR", update=update_color_float
    )
    color_rgb: bpy.props.IntVectorProperty(  # type: ignore
        default=(0, 0, 0), min=0, max=255, update=update_color_rgb
    )
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
    bpy.utils.unregister_class(ColorPaletteTempItem)
