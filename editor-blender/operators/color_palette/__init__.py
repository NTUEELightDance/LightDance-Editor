import bpy

from ...core.actions.state.color_palette import add_color, delete_color, edit_color
from ...core.states import state
from ...core.utils.notification import notify
from ...core.utils.ui import redraw_area
from ...properties.types import ColorPaletteItemType, ColorPaletteType
from ...properties.ui.types import ColorPaletteEditModeType, ColorPaletteStatusType
from ..async_core import AsyncOperator


class ColorPaletteEditModeOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_palette_edit_mode"
    bl_label = ""

    edit_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def execute(self, context: bpy.types.Context):
        edit_index: int = getattr(self, "edit_index")

        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )

        ld_ui_color_palette.edit_index = self.edit_index
        ld_ui_color_palette.edit_mode = ColorPaletteEditModeType.EDIT.value

        ld_color_palette: ColorPaletteType = getattr(
            context.window_manager, "ld_color_palette"
        )
        color_edit = ld_color_palette[edit_index]

        color_temp: ColorPaletteItemType = getattr(
            bpy.context.window_manager, "ld_color_palette_temp"
        )

        color_temp.color_rgb = color_edit.color_rgb
        color_temp.color_float = color_edit.color_float
        color_temp.color_name = color_edit.color_name
        color_temp.color_id = color_edit.color_id

        return {"FINISHED"}


class ColorPaletteNewModeOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_palette_new_mode"
    bl_label = "New"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def execute(self, context: bpy.types.Context):
        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )

        ld_ui_color_palette.edit_mode = ColorPaletteEditModeType.NEW.value

        color_temp: ColorPaletteItemType = getattr(
            bpy.context.window_manager, "ld_color_palette_temp"
        )

        color_temp.color_rgb = (255, 255, 255)
        color_temp.color_float = (1.0, 1.0, 1.0)
        color_temp.color_name = "New color"

        return {"FINISHED"}


class ColorDeleteOperator(AsyncOperator):
    bl_idname = "lightdance.delete_color"
    bl_label = ""

    delete_index: bpy.props.IntProperty()  # type: ignore

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        delete_index: int = getattr(self, "delete_index")

        ld_color_palette: ColorPaletteType = getattr(
            context.window_manager, "ld_color_palette"
        )
        color_delete = ld_color_palette[delete_index]

        try:
            await delete_color(color_delete.color_id)
            notify("INFO", "Deleted color")

            redraw_area("VIEW_3D")

        except Exception as e:
            print(e)
            notify("ERROR", "Failed to delete color")

        return {"FINISHED"}


class ColorCancelOperator(bpy.types.Operator):
    bl_idname = "lightdance.color_palette_cancel"
    bl_label = "Cancel"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def execute(self, context: bpy.types.Context):
        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )
        ld_ui_color_palette.edit_mode = ColorPaletteEditModeType.IDLE.value
        return {"FINISHED"}


class ColorConfirmOperator(AsyncOperator):
    bl_idname = "lightdance.color_palette_confirm"
    bl_label = "Confirm"
    state = ""

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    async def async_execute(self, context: bpy.types.Context):
        ld_ui_color_palette: ColorPaletteStatusType = getattr(
            bpy.context.window_manager, "ld_ui_color_palette"
        )

        edit_mode = ld_ui_color_palette.edit_mode

        match edit_mode:
            case ColorPaletteEditModeType.EDIT.value:
                color_temp: ColorPaletteItemType = getattr(
                    bpy.context.window_manager, "ld_color_palette_temp"
                )

                id = color_temp.color_id
                name = color_temp.color_name
                rgb = (
                    color_temp.color_rgb[0],
                    color_temp.color_rgb[1],
                    color_temp.color_rgb[2],
                )
                try:
                    await edit_color(id, name, rgb)
                    notify("INFO", "Edited color")
                    ld_ui_color_palette.edit_mode = ColorPaletteEditModeType.IDLE.value

                    redraw_area("VIEW_3D")

                except Exception as e:
                    print(e)
                    notify("ERROR", "Failed to edit color")

            case ColorPaletteEditModeType.NEW.value:
                color_temp: ColorPaletteItemType = getattr(
                    bpy.context.window_manager, "ld_color_palette_temp"
                )
                name = color_temp.color_name
                rgb = (
                    color_temp.color_rgb[0],
                    color_temp.color_rgb[1],
                    color_temp.color_rgb[2],
                )
                try:
                    await add_color(name, rgb)
                    notify("INFO", "Added color")
                    ld_ui_color_palette.edit_mode = ColorPaletteEditModeType.IDLE.value

                    redraw_area("VIEW_3D")

                except Exception as e:
                    print(e)
                    notify("ERROR", "Failed to add color")

            case _:
                pass


operator_list = [
    ColorPaletteEditModeOperator,
    ColorDeleteOperator,
    ColorCancelOperator,
    ColorConfirmOperator,
    ColorPaletteNewModeOperator,
]


def register():
    for op in operator_list:
        bpy.utils.register_class(op)


def unregister():
    for op in operator_list:
        bpy.utils.unregister_class(op)
