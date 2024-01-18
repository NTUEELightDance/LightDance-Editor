import bpy

from ...core.actions.state.color_palette import (
    handle_color_confirm,
    handle_color_delete,
)
from ...core.states import state
from ...properties.ui.types import ColorPaletteStatusType
from ..async_core import AsyncOperator


class ColorEditOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_edit"
    bl_label = ""
    editing_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context):
        return state.ready

    def execute(self, context):
        ld_ui_color_panel: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_panel"
        )
        setattr(ld_ui_color_panel, "editing_mode", True)
        setattr(ld_ui_color_panel, "editing_index", self.editing_index)
        setattr(ld_ui_color_panel, "editing_state", "EDIT")
        color_temp = getattr(bpy.context.window_manager, "ld_color_palette_temp")
        color_edit = getattr(context.window_manager, "ld_color_palette")[
            self.editing_index
        ]
        setattr(color_temp, "color_rgb", color_edit.color_rgb)
        setattr(color_temp, "color_float", color_edit.color_float)
        setattr(color_temp, "color_name", color_edit.color_name)
        setattr(color_temp, "color_id", color_edit.color_id)
        return {"FINISHED"}


class ColorNewOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_new"
    bl_label = "New"

    @classmethod
    def poll(cls, context):
        return state.ready

    def execute(self, context):
        ld_ui_color_panel: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_panel"
        )
        setattr(ld_ui_color_panel, "editing_mode", True)
        setattr(ld_ui_color_panel, "editing_state", "NEW")
        color_temp = getattr(bpy.context.window_manager, "ld_color_palette_temp")
        setattr(color_temp, "color_rgb", [255, 255, 255])
        setattr(color_temp, "color_float", [1.0, 1.0, 1.0])
        setattr(color_temp, "color_name", "New color")
        return {"FINISHED"}


class ColorDeleteOperator(AsyncOperator):
    bl_idname = "lightdance.color_delete"
    bl_label = ""
    deleting_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        color_delete = getattr(context.window_manager, "ld_color_palette")[
            self.deleting_index
        ]
        res = await handle_color_delete(int(color_delete.color_id))
        if res:
            self.report({"INFO"}, f"deleted color")
        return {"FINISHED"}


class ColorCancelOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_cancel"
    bl_label = "Cancel"

    @classmethod
    def poll(cls, context):
        return state.ready

    def execute(self, context):
        ld_ui_color_panel: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_panel"
        )
        setattr(ld_ui_color_panel, "editing_mode", False)
        return {"FINISHED"}


class ColorConfirmOperator(AsyncOperator):
    bl_idname = "lightdance.color_confirm"
    bl_label = "Confirm"
    state = ""

    @classmethod
    def poll(cls, context):
        return state.ready

    # TODO: types
    async def async_execute(self, context: bpy.types.Context):
        ld_ui_color_panel: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_panel"
        )
        editing_state = ld_ui_color_panel.editing_state
        setattr(ld_ui_color_panel, "editing_mode", False)
        res = await handle_color_confirm(editing_state)
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
