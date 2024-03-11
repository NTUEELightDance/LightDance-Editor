from typing import Any

import bpy
from bpy.types import Context, UILayout

from ...core.states import state
from ...properties.ui.types import CommandCenterRPiStatusType, CommandCenterStatusType


class LD_UL_DancerList(bpy.types.UIList):
    filtering_connected: bpy.props.BoolProperty(default=False)  # type: ignore
    show_ip: bpy.props.BoolProperty(default=False)  # type: ignore
    show_mac: bpy.props.BoolProperty(default=True)  # type: ignore
    select_all: bpy.props.BoolProperty(default=False)  # type: ignore
    select_all_connect: bpy.props.BoolProperty(default=False)  # type: ignore

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
            split = row.split(factor=0.2)
            column = split.column()
            row = column.row(align=True)
            if self.select_all:
                setattr(item, "selected", True)
            if self.select_all_connect and item.connected:
                setattr(item, "selected", True)
            row.prop(item, "selected", text="", emboss=True)
            row.label(text=item.name, icon=connection_icon)
            column = split.column()
            row = column.row()
            split = row.split(
                factor=(0.5 if self.show_ip else 0.3) if self.show_mac else 0.01
            )
            column = split.column()
            if self.show_mac:
                addr = f"{item.MAC}" if not self.show_ip else f"{item.MAC} / {item.IP}"
                column.label(text=addr, icon=interface_icon)
            column = split.column()
            column.label(text=f"Message: {item.message}", icon="INFO")

        elif self.layout_type in {"GRID"}:
            pass

    def draw_filter(self, context: Context | None, layout: UILayout):
        row = layout.row()
        row.prop(self, "select_all_connect", text="Select all connected RPi")
        row.prop(self, "select_all", text="Select all RPi")
        row = layout.row()
        row.prop(self, "filtering_connected", text="Show connected RPi's only")
        row.prop(self, "show_mac", text="Show MAC addresses")
        if self.show_mac:
            row.prop(self, "show_ip", text="Show IP addresses")

    def filter_items(
        self, context: Context | None, data: Any | None, property: str | Any
    ):
        prop = getattr(data, property)
        return (
            [getattr(item, "connected") for item in prop]
            if self.filtering_connected
            else []
        ), []


class ControlPanel(bpy.types.Panel):
    bl_label = "Control Panel"
    bl_idname = "VIEW_PT_LightDance_ControlPanel"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "Command center"

    @classmethod
    def poll(cls, context: bpy.types.Context):
        return True

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
            row.operator(
                "lightdance.command_center_load", text="Load", icon="FILE_CACHE"
            )
            row.operator(
                "lightdance.command_center_upload", text="Upload", icon="EXPORT"
            )
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
            op = row.operator(
                "lightdance.command_center_color",
                text="R",
            )
            setattr(op, "color", "red")
            op = row.operator(
                "lightdance.command_center_color",
                text="G",
            )
            setattr(op, "color", "green")
            op = row.operator(
                "lightdance.command_center_color",
                text="B",
            )
            setattr(op, "color", "blue")
            op = row.operator(
                "lightdance.command_center_color",
                text="Y/RG",
            )
            setattr(op, "color", "yellow")
            op = row.operator(
                "lightdance.command_center_color",
                text="C/GB",
            )
            setattr(op, "color", "cyan")
            op = row.operator(
                "lightdance.command_center_color",
                text="M/RB",
            )
            op = setattr(op, "color", "magenta")
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
