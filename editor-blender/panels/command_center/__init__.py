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
            column_main = layout.column()
            row = column_main.row()
            split = row.split(factor=0.3)
            column = split.column()
            row = column.row(align=True)
            row.prop(
                item, "selected", text="", emboss=True
            )  # TODO: emboss=item.connected
            row.label(text=item.name, icon=connection_icon)
            column = split.column()
            row = column.row()
            split = row.split(factor=0.5)
            column = split.column()
            column.label(text=f"{item.IP}", icon=interface_icon)
            column = split.column()
            column.label(text=f"{item.MAC}")
            row = column_main.row()
            row.label(text=f"Message: {item.message}", icon="INFO")
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
            row.operator(
                "lightdance.command_center_start", text="Start connection", icon="PLAY"
            )
        else:
            row = layout.row()
            row.operator(
                "lightdance.command_center_refresh",
                text="Reconnect",
                icon="FILE_REFRESH",
            )
            row.operator(
                "lightdance.command_center_sync", text="Sync", icon="UV_SYNC_SELECT"
            )
            row = layout.row()
            row.operator(
                "lightdance.command_center_load", text="Load", icon="FILE_CACHE"
            )
            row.operator(
                "lightdance.command_center_upload", text="Upload", icon="EXPORT"
            )
            row = layout.row()
            row.operator(
                "lightdance.command_center_close_gpio", text="Close", icon="QUIT"
            )
            row.operator(
                "lightdance.command_center_reboot", text="Reboot", icon="RECOVER_LAST"
            )
            row = layout.row()
            split = row.split(factor=0.4)
            column = split.column()
            column.operator(
                "lightdance.command_center_dark_all", text="Dark all", icon="LIGHT"
            )
            column = split.column()
            row = column.row()
            row.operator(
                "lightdance.command_center_color",
                text="Send color",
                icon="OUTLINER_OB_LIGHT",
            )
            row.prop(command_center_status, "color")
            row = column.row()
            row.operator(
                "lightdance.command_center_test",
                text="Send color",
                icon="OUTLINER_OB_LIGHT",
            )
            row.prop(command_center_status, "color_code", text="code")
            row = layout.row()
            split = row.split(factor=0.3)
            column = split.column()
            row = column.row(align=True)
            row.operator("lightdance.command_center_play", text="", icon="PLAY")
            row.operator("lightdance.command_center_pause", text="", icon="PAUSE")
            row.operator("lightdance.command_center_stop", text="", icon="SNAP_FACE")
            op = row.operator("screen.frame_jump", text="", icon="REW")
            setattr(op, "end", False)
            column = split.column()
            row = column.row()
            row.prop(
                command_center_status,
                "countdown",
                text="",
                emboss=False,
                icon=(
                    "KEYTYPE_JITTER_VEC"
                    if command_center_status.countdown == "00:00"
                    else "KEYTYPE_MOVING_HOLD_VEC"
                ),
            )
            row.prop(command_center_status, "delay", text="Delay")
            row = layout.row()
            split = row.split(factor=0.3)
            column = split.column()
            row = column.row(align=True)
            row.operator(
                "lightdance.command_center_web_shell",
                text="Send command",
                icon="CONSOLE",
            )
            column = split.column()
            row = column.row()
            row.prop(command_center_status, "command", text="")
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
