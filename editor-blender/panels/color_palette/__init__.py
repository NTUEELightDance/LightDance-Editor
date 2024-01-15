import bpy
from bpy.types import Context
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

from ...core.states import state

# from Gql_utils import add_color, delete_color
# from ops import ld_colorEditOperator, ld_colorDeleteOperator, ld_colorCancelOperator, ld_colorConfirmOperator, ld_colorNewOperator

"""
temp graphql
"""
transport = AIOHTTPTransport(url="http://localhost:4000/graphql")

client = Client(transport=transport, fetch_schema_from_transport=True)

query = gql(
    """
    query Color {
        colorMap {
            colorMap
        }
    }
    """
)

colormap = client.execute(query)["colorMap"]["colorMap"]  # to be fetched from state


## Init color collection


def lock_colorFloat_change(item):
    item.color_float = [x / 255 for x in item.color_code]
    # print("lock")


def setup_color_data_from_state(colormap):
    for key in colormap:
        item = getattr(bpy.context.window_manager, "ld_ColorPalette").add()
        item.color_id = key
        item.color_name = colormap[key]["color"]
        item.color_code = colormap[key]["colorCode"]
        item.color_float = [x / 255 for x in item.color_code]
        item.color_alpha = 1.0
        bpy.msgbus.subscribe_rna(
            key=(item.color_float),
            owner=bpy,
            args=tuple([item]),
            notify=lock_colorFloat_change,
        )
        bpy.msgbus.subscribe_rna(
            key=(item.color_code),
            owner=bpy,
            args=tuple([item]),
            notify=lock_colorFloat_change,
        )
    color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp").add()
    color_temp.color_code = [0, 0, 0]
    color_temp.color_float = [x / 255 for x in color_temp.color_code]
    color_temp.color_name = ""
    color_temp_item = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_float),
        owner=bpy,
        args=tuple([color_temp_item]),
        notify=lock_colorFloat_change,
    )
    bpy.msgbus.subscribe_rna(
        key=(color_temp_item.color_code),
        owner=bpy,
        args=tuple([color_temp_item]),
        notify=lock_colorFloat_change,
    )


## Define handlers
print("executing panel.py")


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
        layout.use_property_split = False
        layout.use_property_decorate = False

        if not self.editing_mode:
            for i in range(len(getattr(context.window_manager, "ld_ColorPalette"))):
                item = getattr(context.window_manager, "ld_ColorPalette")[i]
                row = layout.row()
                row.prop(
                    item,
                    "color_float",
                    text=f"[{item['color_id']}] {item['color_name']}",
                )
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
            row.prop(temp_item, "color_code", text="RGB")
            row = layout.row()
            row.prop(temp_item, "color_float", text="display")
            row = layout.row()
            row.operator("object.ld_color_cancel")
            row.operator("object.ld_color_confirm")


def register():
    setup_color_data_from_state(colormap)
    bpy.utils.register_class(ColorPalettePanel)


def unregister():
    bpy.utils.unregister_class(ColorPalettePanel)
