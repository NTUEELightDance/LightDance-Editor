import bpy


class ColorPaletteStatus(bpy.types.PropertyGroup):
    editing_mode: bpy.props.BoolProperty()  # type: ignore
    editing_index: bpy.props.IntProperty()  # type: ignore
    editing_state: bpy.props.EnumProperty(
        items=[("EDIT", "edit", ""), ("NEW", "NEW", "")]
    )  # type: ignore


def register():
    bpy.utils.register_class(ColorPaletteStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_color_panel",
        bpy.props.PointerProperty(type=ColorPaletteStatus),
    )


def unregister():
    bpy.utils.unregister_class(ColorPaletteStatus)
    delattr(bpy.types.WindowManager, "ld_ui_color_panel")
