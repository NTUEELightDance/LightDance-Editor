import bpy
from bpy.types import Context
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

from ...core.models import ColorMap
from ...core.states import state


def lock_colorFloat_change(item):
    item.color_float = [x / 255 for x in item.color_rgb]


def setup_color_data_from_state(colormap: ColorMap):
    getattr(bpy.context.window_manager, "ld_ColorPalette").clear()
    for id, color in colormap.items():
        item = getattr(bpy.context.window_manager, "ld_ColorPalette").add()
        item.color_id = id
        item.color_name = color.name
        item.color_rgb = color.rgb
        item.color_float = [x / 255 for x in color.rgb]
        item.color_alpha = 1.0
        item.color_code = color.color_code
        bpy.msgbus.subscribe_rna(
            key=(item.color_float),
            owner=bpy,
            args=tuple([item]),
            notify=lock_colorFloat_change,
        )
        bpy.msgbus.subscribe_rna(
            key=(item.color_rgb),
            owner=bpy,
            args=tuple([item]),
            notify=lock_colorFloat_change,
        )
    color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp").add()
    setattr(color_temp, "color_rgb", [0, 0, 0])
    setattr(color_temp, "color_float", [x / 255 for x in color_temp.color_rgb])
    setattr(color_temp, "color_name", "")
    color_temp_item = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_float),
        owner=bpy,
        args=tuple([color_temp_item]),
        notify=lock_colorFloat_change,
    )
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_rgb),
        owner=bpy,
        args=tuple([color_temp_item]),
        notify=lock_colorFloat_change,
    )


class ColorPalettePanel(bpy.types.Panel):
    bl_label = "Colors"
    bl_idname = "LD_PT_color_palette"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "ColorPalette"

    editing_mode = False
    editing_index = 0  # modified by edit operator
    editing_state = ""  # EDIT or NEW

    @classmethod
    def poll(cls, context: Context) -> bool:
        return state.is_logged_in

    def draw(self, context):
        layout = self.layout
        layout.use_property_split = True
        layout.use_property_decorate = False

        if not self.editing_mode:
            loaded_colors = getattr(context.window_manager, "ld_ColorPalette")
            if not state.is_colorpalette_updated:
                setup_color_data_from_state(state.color_map)
                state.is_colorpalette_updated = True

            for i in range(len(loaded_colors)):
                item = loaded_colors[i]
                row = layout.row()
                row.label(
                    text=f"[{item.color_id}] {item.color_name}",
                )
                row = layout.row()
                row.prop(item, "color_float", text=f"{item.color_code}")
                row = layout.row()
                op = row.operator("object.ld_color_edit")
                setattr(op, "editing_index", i)
                op = row.operator("object.ld_color_delete")
                setattr(op, "deleting_index", i)
            row = layout.row()
            row.operator("object.ld_color_new")
        else:
            temp_item = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
            row = layout.row()
            row.label(text="[Edit mode]")
            row = layout.row()
            row.prop(temp_item, "color_name", text="Name")
            row = layout.row()
            row.prop(temp_item, "color_rgb", text="RGB")
            row = layout.row()
            row.prop(temp_item, "color_float", text="display")
            row = layout.row()
            row.operator("object.ld_color_cancel")
            row.operator("object.ld_color_confirm")


def register():
    bpy.utils.register_class(ColorPalettePanel)


def unregister():
    bpy.utils.unregister_class(ColorPalettePanel)
