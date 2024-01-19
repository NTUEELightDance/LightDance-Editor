import bpy

from ...core.states import state
from ...properties.types import ColorPaletteItemType, ColorPaletteType
from ...properties.ui.types import ColorPaletteEditModeType, ColorPaletteStatusType


class ColorPalettePanel(bpy.types.Panel):
    bl_label = "Color Palette"
    bl_idname = "VIEW_PT_LightDance_ColorPalette"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "ColorPalette"

    @classmethod
    def poll(cls, context: bpy.types.Context) -> bool:
        return state.ready

    def draw(self, context: bpy.types.Context):
        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )

        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False

        if ld_ui_color_palette.edit_mode == ColorPaletteEditModeType.IDLE.value:
            loaded_colors: ColorPaletteType = getattr(
                context.window_manager, "ld_color_palette"
            )
            row = layout.row()
            row.operator("lightdance.color_palette_new_mode", icon="ADD")

            for i, item in enumerate(loaded_colors):
                row = layout.row()
                split = row.split()
                split.operator("lightdance.empty", text=item.color_name)
                split.prop(item, "color_float", text="")
                split = row.split(align=True)
                op = split.operator(
                    "lightdance.color_palette_edit_mode", icon="GREASEPENCIL"
                )
                setattr(op, "edit_index", i)
                op = split.operator("lightdance.delete_color", icon="TRASH")
                setattr(op, "delete_index", i)
        else:
            temp_item: ColorPaletteItemType = getattr(
                context.window_manager, "ld_color_palette_temp"
            )
            row = layout.row()
            row.label(text="Editing Color")
            row = layout.row()
            row.prop(temp_item, "color_name", text="Name")
            row = layout.row()
            row.prop(temp_item, "color_rgb", text="RGB")
            row = layout.row()
            row.prop(temp_item, "color_float", text="display")
            row = layout.row()
            row.operator("lightdance.color_palette_cancel", icon="PANEL_CLOSE")
            row.operator("lightdance.color_palette_confirm", icon="CHECKMARK")


def register():
    bpy.utils.register_class(ColorPalettePanel)


def unregister():
    bpy.utils.unregister_class(ColorPalettePanel)
