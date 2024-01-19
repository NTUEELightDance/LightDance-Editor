import bpy

from .types import ColorPaletteEditModeType


class ColorPaletteStatus(bpy.types.PropertyGroup):
    edit_index: bpy.props.IntProperty()  # type: ignore
    edit_mode: bpy.props.EnumProperty(  # type: ignore
        items=[
            (ColorPaletteEditModeType.IDLE.value, "", ""),
            (ColorPaletteEditModeType.EDIT.value, "", ""),
            (ColorPaletteEditModeType.NEW.value, "", ""),
        ],
        default=ColorPaletteEditModeType.IDLE.value,
    )


def register():
    bpy.utils.register_class(ColorPaletteStatus)
    setattr(
        bpy.types.WindowManager,
        "ld_ui_color_palette",
        bpy.props.PointerProperty(type=ColorPaletteStatus),
    )


def unregister():
    bpy.utils.unregister_class(ColorPaletteStatus)
    delattr(bpy.types.WindowManager, "ld_ui_color_palette")
