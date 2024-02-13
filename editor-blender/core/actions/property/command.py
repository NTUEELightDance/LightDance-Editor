from typing import List

import bpy

from ....properties.ui.types import CommandCenterRPiStatusType, CommandCenterStatusType
from ...states import state


def set_command_status(connected: bool):
    command_status: CommandCenterStatusType = getattr(
        bpy.context.window_manager, "ld_ui_command_center"
    )
    command_status.connected = connected


def set_RPi_props_from_state():
    rpi_props: List[CommandCenterRPiStatusType] = getattr(
        bpy.context.window_manager, "ld_ui_rpi_status"
    )

    rpi_status = state.rpi_status
    if not rpi_props:
        for dancer_name, dancer_item in rpi_status.items():
            rpi_item: CommandCenterRPiStatusType = getattr(
                bpy.context.window_manager, "ld_ui_rpi_status"
            ).add()
            rpi_item.name = dancer_name
            if dancer_item.ethernet.connected == dancer_item.wifi.connected:
                rpi_item.interface_type = "ethernet"
                interface_status = dancer_item.ethernet
            elif dancer_item.ethernet.connected:
                rpi_item.interface_type = "ethernet"
                interface_status = dancer_item.ethernet
            else:
                rpi_item.interface_type = "wifi"
                interface_status = dancer_item.wifi

            rpi_item.IP = interface_status.IP
            rpi_item.MAC = interface_status.MAC
            rpi_item.connected = interface_status.connected
            rpi_item.message = interface_status.message
            rpi_item.statusCode = interface_status.statusCode
            rpi_item.selected = False
    else:
        for dancer_name, dancer_item in rpi_status.items():
            rpi_item: CommandCenterRPiStatusType = next(
                item for item in rpi_props if item.name == dancer_name
            )
            if dancer_item.ethernet.connected == dancer_item.wifi.connected:
                interface_status = dancer_item.ethernet
            elif dancer_item.ethernet.connected:
                interface_status = dancer_item.ethernet
            else:
                interface_status = dancer_item.wifi
            rpi_item.connected = interface_status.connected
            rpi_item.message = interface_status.message
            rpi_item.statusCode = interface_status.statusCode


def get_selected_dancer() -> List[str]:
    rpi_status_list: List[CommandCenterRPiStatusType] = getattr(
        bpy.context.window_manager, "ld_ui_rpi_status"
    )
    return [item.name for item in rpi_status_list if item.selected]
