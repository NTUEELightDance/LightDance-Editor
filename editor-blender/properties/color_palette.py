import bpy


class ColorPaletteItem(bpy.types.PropertyGroup):
    color_id: bpy.props.IntProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(default=(0, 0, 0), min=0, max=1, subtype="COLOR")  # type: ignore
    color_rgb: bpy.props.IntVectorProperty(default=(0, 0, 0), min=0, max=255)  # type: ignore
    color_alpha: bpy.props.FloatProperty(default=1, min=0, max=1)  # type: ignore
    color_code: bpy.props.StringProperty()  # type: ignore


def register():
    bpy.utils.register_class(ColorPaletteItem)
    setattr(
        bpy.types.WindowManager,
        "ld_color_palette",
        bpy.props.CollectionProperty(type=ColorPaletteItem),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_color_palette_temp",
        bpy.props.CollectionProperty(type=ColorPaletteItem),
    )
    getattr(bpy.context.window_manager, "ld_color_palette_temp").add()
    # bpy.msgbus.clear_by_owner(bpy)


def unregister():
    bpy.utils.unregister_class(ColorPaletteItem)
    getattr(bpy.context.window_manager, "ld_color_palette").clear()
    delattr(bpy.types.WindowManager, "ld_color_palette")
