import bpy

from ...api.color_agent import color_agent
from ...core.states import state
from ..async_core import AsyncOperator


async def handle_colorDelete(index: int):
    res = await color_agent.delete_color(index)
    return res["deleteColor"]


async def handle_colorConfirm(editing_state):
    color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
    if editing_state == "EDIT":
        response = await color_agent.edit_color(int(color_temp.color_id), str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["editColor"]
    elif editing_state == "NEW":
        response = await color_agent.add_color(str(color_temp.color_name), tuple(color_temp.color_rgb))  # type: ignore
        return response["addColor"]  # type: ignore


class ColorEditOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_edit"
    bl_label = "Edit"
    editing_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context):
        return state.is_logged_in

    def execute(self, context):
        panel = getattr(bpy.types, "LD_PT_color_palette")
        setattr(panel, "editing_mode", True)
        setattr(panel, "editing_index", self.editing_index)
        setattr(panel, "editing_state", "EDIT")
        color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
        color_edit = getattr(context.window_manager, "ld_ColorPalette")[
            self.editing_index
        ]
        setattr(color_temp, "color_rgb", color_edit.color_rgb)
        setattr(color_temp, "color_float", color_edit.color_float)
        setattr(color_temp, "color_name", color_edit.color_name)
        setattr(color_temp, "color_id", color_edit.color_id)
        return {"FINISHED"}


class ColorNewOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_new"
    bl_label = "New"

    @classmethod
    def poll(cls, context):
        return state.is_logged_in

    def execute(self, context):
        panel = getattr(bpy.types, "LD_PT_color_palette")
        setattr(panel, "editing_mode", True)
        setattr(panel, "editing_state", "NEW")
        color_temp = getattr(bpy.context.window_manager, "ld_ColorPalette_temp")[0]
        setattr(color_temp, "color_rgb", [255, 255, 255])
        setattr(color_temp, "color_float", [1.0, 1.0, 1.0])
        setattr(color_temp, "color_name", "New color")
        return {"FINISHED"}


class ColorDeleteOperator(AsyncOperator):
    bl_idname = "object.ld_color_delete"
    bl_label = "Delete"
    deleting_index: bpy.props.IntProperty()  # type: ignore

    async def async_execute(self, context: bpy.types.Context):
        color_delete = getattr(context.window_manager, "ld_ColorPalette")[
            self.deleting_index
        ]
        res = await handle_colorDelete(int(color_delete.color_id))
        if res:
            self.report({"INFO"}, f"deleted color")
        return {"FINISHED"}


class ColorCancelOperator(bpy.types.Operator):
    bl_idname = "object.ld_color_cancel"
    bl_label = "Cancel"

    @classmethod
    def poll(cls, context):
        return state.is_logged_in

    def execute(self, context):
        panel = getattr(bpy.types, "LD_PT_color_palette")
        setattr(panel, "editing_mode", False)
        return {"FINISHED"}


class ColorConfirmOperator(AsyncOperator):
    bl_idname = "object.ld_color_confirm"
    bl_label = "Confirm"
    state = ""

    # TODO: types
    async def async_execute(self, context: bpy.types.Context):
        panel = getattr(bpy.types, "LD_PT_color_palette")
        editing_state = panel.editing_state
        setattr(panel, "editing_mode", False)
        res = await handle_colorConfirm(editing_state)
        if res:
            if editing_state == "EDIT":
                self.report({"INFO"}, f'edited color "{res.color}"')
            elif editing_state == "NEW":
                self.report({"INFO"}, f'added color "{res.color}"')
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
