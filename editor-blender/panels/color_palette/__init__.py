import bpy
from bpy.types import Context
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from ...core.states import state
#from Gql_utils import add_color, delete_color
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

colormap = client.execute(query)['colorMap']['colorMap'] # to be fetched from state


## Init color collection

def lock_colorFloat_change(item):
    item.colorFloat = [x/255 for x in item.colorCode]
    # print("lock")

def setup_color_data_from_state(colormap):
    for key in colormap:
            item = getattr(bpy.context.window_manager,"ld_ColorPalette").add()
            item.colorId = key
            item.colorName = colormap[key]['color']
            item.colorCode = colormap[key]['colorCode']
            item.colorFloat = [x/255 for x in item.colorCode]
            item.colorAlpha = 1.0
            bpy.msgbus.subscribe_rna(
                key=(item.colorFloat),
                owner=bpy,
                args=tuple([item]),
                notify=lock_colorFloat_change
                )
            bpy.msgbus.subscribe_rna(
                key=(item.colorCode),
                owner=bpy,
                args=tuple([item]),
                notify=lock_colorFloat_change
                )
    color_temp = getattr(bpy.context.window_manager,"ld_ColorPalette_temp").add()
    color_temp.colorCode = [0,0,0]
    color_temp.colorFloat = [x/255 for x in color_temp.colorCode]
    color_temp.colorName = ""
    color_temp_item = getattr(bpy.context.window_manager,"ld_ColorPalette_temp")[0]
    bpy.msgbus.subscribe_rna(
            key=(color_temp_item.colorFloat),
            owner=bpy,
            args=tuple([color_temp_item]),
            notify=lock_colorFloat_change
            )
    bpy.msgbus.subscribe_rna(
            key=(color_temp_item.colorCode),
            owner=bpy,
            args=tuple([color_temp_item]),
            notify=lock_colorFloat_change
            )


## Define handlers
print("executing panel.py")

class ColorPalettePanel(bpy.types.Panel):
    bl_label = "Colors"
    bl_idname = "LD_PT_color_palette"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "ColorPalette"
    
    editing_mode = False
    editing_index = 0 # modified by edit operator
    editing_state = "" # EDIT or NEW
    
    @classmethod
    def poll(cls, context: Context) -> bool:
        return state.is_logged_in
    
    def draw(self, context):
        layout = self.layout
        layout.use_property_split = False
        layout.use_property_decorate= False
        
        if not self.editing_mode:
            for i in range(len(getattr(context.window_manager,"ld_ColorPalette"))):
                item = getattr(context.window_manager,"ld_ColorPalette")[i]
                row = layout.row()
                row.prop(item,"colorFloat",text=f"[{item['colorId']}] {item['colorName']}")
                row = layout.row()
                op = row.operator("object.ld_color_edit")
                setattr(op, "editing_index", i)
                op = row.operator("object.ld_color_delete")
                setattr(op, "deleting_index", i)
            row = layout.row()
            row.operator("object.ld_color_new")
        else:
            temp_item = getattr(bpy.context.window_manager,"ld_ColorPalette_temp")[0]
            row = layout.row()
            row.label(text="[Edit mode]")
            row = layout.row()
            row.prop(temp_item, 'colorName', text="Name")
            row = layout.row()
            row.prop(temp_item, 'colorCode', text="RGB")
            row = layout.row()
            row.prop(temp_item, 'colorFloat', text="display")
            row = layout.row()
            row.operator("object.ld_color_cancel")
            row.operator("object.ld_color_confirm")



def register():
    setup_color_data_from_state(colormap)
    bpy.utils.register_class(ColorPalettePanel)

def unregister():
    bpy.utils.unregister_class(ColorPalettePanel)