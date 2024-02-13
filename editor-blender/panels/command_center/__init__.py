from typing import Any

import bpy
from bpy.types import Context, UILayout

from ...core.states import state
from ...properties.ui.types import CommandCenterRPiStatusType, CommandCenterStatusType


class LD_UL_DancerList(bpy.types.UIList):
    def draw_item(
        self,
        context: Context | None,
        layout: UILayout,
        data: Any | None,
        item: CommandCenterRPiStatusType,
        icon: int | None,
        active_data: Any,
        active_property: str,
        index: Any | None = 0,
        flt_flag: Any | None = 0,
    ):
        connection_icon = (
            "SEQUENCE_COLOR_04" if item.connected else "SEQUENCE_COLOR_01"
        )  # green and red square
        interface_icon = "URL" if item.interface_type == "wifi" else "PLUGIN"
        if self.layout_type in {"DEFAULT", "COMPACT"}:
            layout.prop(
                item, "selected", text="", emboss=True
            )  # TODO: emboss=item.connected
            layout.label(text=item.name, icon=connection_icon)
            layout.label(text=f"{item.IP} / {item.MAC}", icon=interface_icon)
            layout.label(text=f'"{item.message}"')
        elif self.layout_type in {"GRID"}:
            pass  # NOTE: Not sure when this case happens


class ControlPanel(bpy.types.Panel):
    bl_label = "Control Panel"
    bl_idname = "VIEW_PT_LightDance_ControlPanel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Command center"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return state.ready

    def draw(self, context: bpy.types.Context):
        command_center_status: CommandCenterStatusType = getattr(
            bpy.context.window_manager, "ld_ui_command_center"
        )
        connected = command_center_status.connected
        layout = self.layout
        layout.enabled = not state.requesting
        if not connected:
            row = layout.row()
            row.operator("lightdance.command_center_refresh", text="Connect")
        else:
            row = layout.row()
            row.operator("lightdance.command_center_refresh", text="Refresh")
            row.operator("lightdance.command_center_sync", text="Sync")
            row = layout.row()
            row.operator("lightdance.command_center_dark_all", text="dark all")
            row.operator("lightdance.command_center_load", text="load")
            row.operator("lightdance.command_center_upload", text="upload")
            row = layout.row()
            row.operator("lightdance.command_center_close_gpio", text="Close")
            row.operator("lightdance.command_center_reboot", text="Reboot")
            row = layout.row()
            op = row.operator("lightdance.command_center_color", text="Send color")
            row.prop(op, "color")
            row = layout.row()
            row.template_list(
                "LD_UL_DancerList",
                "",
                bpy.context.window_manager,
                "ld_ui_rpi_status",
                bpy.context.window_manager,
                "ld_ui_command_center_dancer_index",
            )


def register():
    bpy.utils.register_class(LD_UL_DancerList)
    bpy.utils.register_class(ControlPanel)


def unregister():
    bpy.utils.unregister_class(LD_UL_DancerList)
    bpy.utils.unregister_class(ControlPanel)
