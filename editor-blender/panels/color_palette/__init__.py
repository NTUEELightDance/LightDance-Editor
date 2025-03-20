from typing import Any

import bpy

from ...core.states import state
from ...properties.types import ColorPaletteItemType, ColorPaletteType
from ...properties.ui.types import ColorPaletteEditModeType, ColorPaletteStatusType


class LD_UL_ColorPaletteList(bpy.types.UIList):
    def draw_item(
        self,
        context: bpy.types.Context | None,
        layout: bpy.types.UILayout,
        data: ColorPaletteType,
        item: ColorPaletteItemType,
        icon: int | None,
        active_data: Any,
        active_property: str | None,
        index: int | None = 0,
        flt_flag: int | None = 0,
    ):
        if not item:
            return
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            row = layout.row()
            split = row.split()
            split.operator("lightdance.empty", text=item.color_name)
            split.prop(item, "color_float", text="")
            split = row.split(align=True)
            op = split.operator(
                "lightdance.color_palette_edit_mode", icon="GREASEPENCIL"
            )
            setattr(op, "edit_index", index)
            op = split.operator("lightdance.delete_color", icon="TRASH")
            setattr(op, "delete_index", index)
        elif self.layout_type in {"GRID"}:
            pass

    def filter_items(self, context: bpy.types.Context | None, data, propname: str):
        loaded_colors: ColorPaletteType = getattr(data, propname)
        return [
            1 << 30 if (self.filter_name.lower() in item.color_name.lower()) else 0
            for item in loaded_colors
        ], ()


class ColorPalettePanel(bpy.types.Panel):
    bl_label = "Color Palette"
    bl_idname = "VIEW_PT_LightDance_ColorPalette"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "ColorPalette"

    @classmethod
    def poll(cls, context: bpy.types.Context | None) -> bool:
        return state.ready

    def draw(self, context: bpy.types.Context | None):
        if not bpy.context:
            return
        layout = self.layout
        layout.enabled = not state.requesting

        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )

        layout.use_property_split = True
        layout.use_property_decorate = False

        if ld_ui_color_palette.edit_mode == ColorPaletteEditModeType.IDLE.value:
            row = layout.row()
            row.operator("lightdance.color_palette_new_mode", icon="ADD")

            row = layout.row()
            row.template_list(
                "LD_UL_ColorPaletteList",
                "",
                bpy.context.window_manager,
                "ld_color_palette",
                bpy.context.window_manager,
                "ld_color_palette_index",
            )

        else:
            temp_item: ColorPaletteItemType = getattr(
                bpy.context.window_manager, "ld_color_palette_temp"
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
    bpy.utils.register_class(LD_UL_ColorPaletteList)
    bpy.utils.register_class(ColorPalettePanel)


def unregister():
    bpy.utils.unregister_class(LD_UL_ColorPaletteList)
    bpy.utils.unregister_class(ColorPalettePanel)
