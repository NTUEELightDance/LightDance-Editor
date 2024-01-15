import bpy
from gql import Client, gql
from gql.transport.aiohttp import AIOHTTPTransport

from ...api.color_agent import color_agent
from ...properties.color_palette import ld_ColorItem
from ..async_core import AsyncOperator


def add_color(color_name: str, color_code: list):
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

    variable = {"color": {"color": color_name, "colorCode": {"set": color_code}}}

    response = client.execute(mutation, variable)
    return response


def delete_color(color_id: int):
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

    variable = {"deleteColorId": color_id}

    response = client.execute(mutation, variable)
    return response


def edit_color(color_id: int, color_name: str, color_code: list):
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
        "data": {"colorCode": {"set": color_code}, "color": {"set": color_name}},
        "editColorId": color_id,
    }
    response = client.execute(mutation, variable)
    return response


def refresh_colormap():
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
    colormap = client.execute(query)["colorMap"]["colorMap"]
    setattr(
        bpy.types.WindowManager,
        "ld_ColorPalette",
        bpy.props.CollectionProperty(type=ld_ColorItem),
    )
    getattr(bpy.context.window_manager, "ld_ColorPalette").clear()
    for key in colormap:
        item = getattr(bpy.context.window_manager, "ld_ColorPalette").add()
        item.color_id = key
        item.color_name = colormap[key]["color"]
        item.color_code = colormap[key]["colorCode"]
        item.color_float = [x / 255 for x in item.color_code]
        item.color_alpha = 1.0


def handle_colorEdit(context, editing_index):
    panel = getattr(bpy.types, "LD_PT_color_palette")
    panel.editing_index = editing_index
    print(f"editing {editing_index}")


def handle_colorNew(context):  # may not needed
    print("adding color")


async def handle_colorDelete(index: int):
    print(f"delete color {index}")
    res = await color_agent.delete_color(index)
    return res["deleteColor"]  # type: ignore


def handle_colorCancel(context):
    print("edit cancelled")


async def handle_colorConfirm(editing_state):
    # TODO: types
    color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
    print("confirmed change")
    if editing_state == "EDIT":
        response = await color_agent.edit_color(int(color_temp["color_id"]), str(color_temp["color_name"]), tuple(color_temp["color_code"]))  # type: ignore
        return response["editColor"]  # type: ignore
    elif editing_state == "NEW":
        response = await color_agent.add_color(str(color_temp["color_name"]), tuple(color_temp["color_code"]))  # type: ignore
        return response["addColor"]  # type: ignore


class ColorEditOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_edit"
    bl_label = "Edit"
    editing_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        handle_colorEdit(context, self.editing_index)
        panel = getattr(bpy.types, "LD_PT_color_palette")
        panel.editing_mode = True
        panel.editing_index = self.editing_index
        panel.editing_state = "EDIT"
        color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
        color_edit = getattr(context.window_manager, "ld_ColorPalette")[
            self.editing_index
        ]
        color_temp["color_code"] = color_edit["color_code"]
        color_temp["color_float"] = color_edit["color_float"]
        color_temp["color_name"] = color_edit["color_name"]
        color_temp["color_id"] = color_edit["color_id"]
        return {"FINISHED"}


class ColorNewOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_new"
    bl_label = "New"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        handle_colorNew(context)
        panel = getattr(bpy.types, "LD_PT_color_palette")
        panel.editing_mode = True
        panel.editing_state = "NEW"
        color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
        color_temp["color_code"] = [255, 255, 255]
        color_temp["color_float"] = [1.0, 1.0, 1.0]
        color_temp["color_name"] = "New color"
        return {"FINISHED"}


class ColorDeleteOperator(AsyncOperator):
    bl_idname = "object.ld_color_delete"
    bl_label = "Delete"
    deleting_index: bpy.props.IntProperty()  # type: ignore

    async def async_execute(self, context: bpy.types.Context):
        print("deleting")
        color_delete = getattr(context.window_manager, "ld_ColorPalette")[
            self.deleting_index
        ]
        res = await handle_colorDelete(int(color_delete["color_id"]))
        if res:
            try:
                self.report({"INFO"}, f"deleted color")
            except:
                print(res)
        refresh_colormap()
        return {"FINISHED"}


class ColorCancelOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_cancel"
    bl_label = "Cancel"

    @classmethod
    def poll(cls, context):
        return context.active_object is not None

    def execute(self, context):
        handle_colorCancel(context)
        panel = getattr(bpy.types, "LD_PT_color_palette")
        panel.editing_mode = False
        refresh_colormap()
        return {"FINISHED"}


class ColorConfirmOperator(AsyncOperator):
    bl_idname = "object.ld_color_confirm"
    bl_label = "Confirm"
    state = ""

    # TODO: types
    async def async_execute(self, context: bpy.types.Context):
        panel = getattr(bpy.types, "LD_PT_color_palette")
        editing_state = panel.editing_state
        panel.editing_mode = False
        res = await handle_colorConfirm(editing_state)
        if res:
            try:
                if editing_state == "EDIT":
                    self.report({"INFO"}, f"edited color \"{res['color']}\"")  # type: ignore
                elif editing_state == "NEW":
                    self.report({"INFO"}, f"added color \"{res['color']}\"")  # type: ignore
            except:
                print(res)
        refresh_colormap()
        return {"FINISHED"}


operator_list = [
    ColorEditOperator,
    ColorDeleteOperator,
    ColorCancelOperator,
    ColorConfirmOperator,
    ColorNewOperator,
]


def register():
    for op in operator_list:
        bpy.utils.register_class(op)


def unregister():
    for op in operator_list:
        bpy.utils.unregister_class(op)
