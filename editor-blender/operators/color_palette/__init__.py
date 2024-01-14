import bpy
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from ...properties.color_palette import ld_ColorItem
from ..async_core import AsyncOperator
from ...api.color_agent import color_agent

def add_color(colorName: str, colorCode: list):
    transport = AIOHTTPTransport(url="http://localhost:4000/graphql")

    client = Client(transport=transport, fetch_schema_from_transport=True)

    mutation = gql(
        """
        mutation Mutation($color: ColorCreateInput!) {
            addColor(color: $color) {
                id
                color
                colorCode
            }
        }
        """
    )
    
    variable = {
        "color": {
            "color": colorName,
            "colorCode": {
            "set": colorCode
            }
        }
    }
    
    response = client.execute(mutation, variable)
    return response

def delete_color(colorId: int):
    transport = AIOHTTPTransport(url="http://localhost:4000/graphql")

    client = Client(transport=transport, fetch_schema_from_transport=True)

    mutation = gql(
        """
        mutation Mutation($deleteColorId: Int!) {
            deleteColor(id: $deleteColorId) {
                id
                ok
                msg
            }
        }
        """
    )
    
    variable = {
    "deleteColorId": colorId
    }
    
    response = client.execute(mutation, variable)
    return response

def edit_color(colorId: int, colorName: str, colorCode: list):
    transport = AIOHTTPTransport(url="http://localhost:4000/graphql")
    client = Client(transport=transport, fetch_schema_from_transport=True)
    mutation = gql(
        """
        mutation Mutation($editColorId: Int!, $data: ColorUpdateInput!) {
            editColor(id: $editColorId, data: $data) {
                id
                color
                colorCode
            }
        }
        """
    )
    variable = {
        "data": {
            "colorCode": {
                "set": colorCode
            },
            "color": {
                "set": colorName
            }
        },
        "editColorId": colorId
    }   
    response = client.execute(mutation, variable)
    return response

def refreshColormap():
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
    colormap = client.execute(query)['colorMap']['colorMap']
    setattr(bpy.types.WindowManager,"ld_ColorPalette", bpy.props.CollectionProperty(type=ld_ColorItem))
    getattr(bpy.context.window_manager,"ld_ColorPalette").clear()
    for key in colormap:
        item = getattr(bpy.context.window_manager,"ld_ColorPalette").add()
        item.colorId = key
        item.colorName = colormap[key]['color']
        item.colorCode = colormap[key]['colorCode']
        item.colorFloat = [x/255 for x in item.colorCode]
        item.colorAlpha = 1.0
    
def handle_colorEdit(context, editing_index):
    panel = getattr(bpy.types,"LD_PT_color_palette")
    panel.editing_index = editing_index
    print(f"editing {editing_index}")

def handle_colorNew(context): # may not needed
    print('adding color')

async def handle_colorDelete(index: int):
    print(f"delete color {index}")
    res = await color_agent.delete_color(index)
    return res['deleteColor'] # type: ignore

def handle_colorCancel(context):
    print("edit cancelled")

async def handle_colorConfirm(editing_state):
    # TODO: types
    color_temp = getattr(bpy.context.window_manager,"ld_ColorPalette_temp")[0]
    print("confirmed change")
    if editing_state == "EDIT":
        response = await color_agent.edit_color(int(color_temp['colorId']), str(color_temp['colorName']), tuple(color_temp['colorCode'])) # type: ignore
        return response['editColor'] # type: ignore
    elif editing_state == "NEW":
        response = await color_agent.add_color(str(color_temp['colorName']), tuple(color_temp['colorCode'])) # type: ignore
        return response['addColor'] # type: ignore

## Define operators

class ld_colorEditOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_edit"
    bl_label = "Edit"
    editing_index: bpy.props.IntProperty() # type: ignore
    
    @classmethod
    def poll(cls, context):
        return context.active_object is not None
    
    def execute(self, context):
        handle_colorEdit(context, self.editing_index)
        panel = getattr(bpy.types, "LD_PT_color_palette")
        panel.editing_mode = True
        panel.editing_index = self.editing_index
        panel.editing_state = "EDIT"
        color_temp = getattr(bpy.context.window_manager,"ld_ColorPalette_temp")[0]
        color_edit = getattr(context.window_manager,"ld_ColorPalette")[self.editing_index]
        color_temp['colorCode'] = color_edit['colorCode']
        color_temp['colorFloat'] = color_edit['colorFloat']
        color_temp['colorName'] = color_edit['colorName']
        color_temp['colorId'] = color_edit['colorId']
        return {'FINISHED'}

class ld_colorNewOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_new"
    bl_label = "New"
    
    @classmethod
    def poll(cls, context):
        return context.active_object is not None
    
    def execute(self, context):
        handle_colorNew(context)
        panel = getattr(bpy.types,"LD_PT_color_palette")
        panel.editing_mode = True
        panel.editing_state = "NEW"
        color_temp = getattr(bpy.context.window_manager,"ld_ColorPalette_temp")[0]
        color_temp['colorCode'] = [255, 255, 255]
        color_temp['colorFloat'] = [1.0, 1.0, 1.0]
        color_temp['colorName'] = "New color"
        return {'FINISHED'}

class ld_colorDeleteOperator(AsyncOperator):
    bl_idname = "object.ld_color_delete"
    bl_label = "Delete"
    deleting_index: bpy.props.IntProperty() # type: ignore
    
    async def async_execute(self, context: bpy.types.Context):
        print("deleting")
        color_delete = getattr(context.window_manager,"ld_ColorPalette")[self.deleting_index]
        res = await handle_colorDelete(int(color_delete['colorId']))
        if res:
            try:
                self.report({'INFO'}, f"deleted color")
            except:
                print(res)
        refreshColormap()
        return {'FINISHED'}
    
class ld_colorCancelOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_cancel"
    bl_label = "Cancel"
    
    @classmethod
    def poll(cls, context):
        return context.active_object is not None
    
    def execute(self, context):
        handle_colorCancel(context)
        panel = getattr(bpy.types,"LD_PT_color_palette")
        panel.editing_mode = False
        refreshColormap()
        return {'FINISHED'}

class ld_colorConfirmOperator(AsyncOperator):
    bl_idname = "object.ld_color_confirm"
    bl_label = "Confirm"
    state = ""
    # TODO: types
    async def async_execute(self, context: bpy.types.Context):
        panel = getattr(bpy.types,"LD_PT_color_palette")
        editing_state = panel.editing_state
        print("chk 1")
        res = await handle_colorConfirm(editing_state)
        print("chk 2")
        if res:
            try:
                if editing_state == "EDIT":
                    self.report({'INFO'}, f"edited color \"{res['color']}\"") # type: ignore
                elif editing_state == "NEW":
                    self.report({'INFO'}, f"added color \"{res['color']}\"") # type: ignore
            except:
                print(res)
        print("chk 3")
        panel.editing_mode = False
        print("comfirmed")
        refreshColormap()
        return {'FINISHED'}

operator_list = [ld_colorEditOperator, ld_colorDeleteOperator, ld_colorCancelOperator, ld_colorConfirmOperator, ld_colorNewOperator]

def register():
    for op in operator_list:
        bpy.utils.register_class(op)

def unregister():
    for op in operator_list:
        bpy.utils.unregister_class(op)