import bpy


class ld_ColorItem(bpy.types.PropertyGroup):
    color_id: bpy.props.StringProperty()  # type: ignore
    color_name: bpy.props.StringProperty(default="")  # type: ignore
    color_float: bpy.props.FloatVectorProperty(default=(0, 0, 0), min=0, max=1, subtype="COLOR")  # type: ignore
    color_code: bpy.props.IntVectorProperty(default=(0, 0, 0), min=0, max=255)  # type: ignore
    color_alpha: bpy.props.FloatProperty(default=1, min=0, max=1)  # type: ignore


def register():
    bpy.utils.register_class(ld_ColorItem)
    setattr(
        bpy.types.WindowManager,
        "ld_ColorPalette",
        bpy.props.CollectionProperty(type=ld_ColorItem),
    )
    setattr(
        bpy.types.WindowManager,
        "ld_ColorPalette_temp",
        bpy.props.CollectionProperty(type=ld_ColorItem),
    )
    # bpy.msgbus.clear_by_owner(bpy)


def unregister():
    bpy.utils.unregister_class(ld_ColorItem)
    getattr(bpy.context.window_manager, "ld_ColorPalette").clear()
    delattr(bpy.types.WindowManager, "ld_ColorPalette")
