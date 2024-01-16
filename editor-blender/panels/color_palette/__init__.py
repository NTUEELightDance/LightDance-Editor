import bpy
from bpy.types import Context

from ...core.states import state
from ...properties.ui.types import ColorPaletteStatusType


class ColorPalettePanel(bpy.types.Panel):
    bl_label = "Color Palette"
    bl_idname = "VIEW_PT_LightDance_ColorPalette"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "ColorPalette"

    @classmethod
    def poll(cls, context: Context) -> bool:
        return state.ready

    def draw(self, context):
        ld_ui_color_panel: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_panel"
        )

        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False

        if not getattr(ld_ui_color_panel, "editing_mode"):
            loaded_colors = getattr(context.window_manager, "ld_color_palette")
            row = layout.row()
            row.operator("lightdance.color_new", icon="ADD")
            for i in range(len(loaded_colors)):
                item = loaded_colors[i]
                row = layout.row()
                row.label(
                    text=f"[{item.color_id}] {item.color_name}: {item.color_code}",
                )
                row = layout.row()
                row.prop(item, "color_float", text="")
                op = row.operator("lightdance.color_edit", icon="GREASEPENCIL")
                setattr(op, "editing_index", i)
                op = row.operator("lightdance.color_delete", icon="TRASH")
                setattr(op, "deleting_index", i)
        else:
            temp_item = getattr(context.window_manager, "ld_color_palette_temp")[0]
            row = layout.row()
            row.label(text="[Edit mode]")
            row = layout.row()
            row.prop(temp_item, "color_name", text="Name")
            row = layout.row()
            row.prop(temp_item, "color_rgb", text="RGB")
            row = layout.row()
            row.prop(temp_item, "color_float", text="display")
            row = layout.row()
            row.operator("lightdance.color_cancel", icon="PANEL_CLOSE")
            row.operator("lightdance.color_confirm", icon="CHECKMARK")


def register():
    bpy.utils.register_class(ColorPalettePanel)


def unregister():
    bpy.utils.unregister_class(ColorPalettePanel)
