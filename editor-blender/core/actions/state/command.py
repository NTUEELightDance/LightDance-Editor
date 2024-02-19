from ....graphqls.command import (
    FromControllerServerBoardInfoPayload,
    FromControllerServerCommandResponse,
)
from ...models import InterfaceStatus, RPiStatusItem, ShellTransaction
from ...states import state
from ..property.command import set_RPi_props_from_state


def read_board_info_payload(payload: FromControllerServerBoardInfoPayload):
    for item in payload.values():
        rpi_status = state.rpi_status
        if item.dancer not in rpi_status:
            rpi_status[item.dancer] = RPiStatusItem(
                ethernet=InterfaceStatus(
                    name=item.dancer,
                    IP=item.IP,
                    MAC=item.MAC,
                    connected=False,
                    statusCode=0,
                    message="",
                ),
                wifi=InterfaceStatus(
                    name=item.dancer,
                    IP=item.IP,
                    MAC=item.MAC,
                    connected=False,
                    statusCode=0,
                    message="",
                ),
            )
        match item.interface:
            case "ethernet":
                rpi_status[item.dancer].ethernet = InterfaceStatus(
                    name=item.dancer,
                    IP=item.IP,
                    MAC=item.MAC,
                    connected=item.connected,
                    statusCode=0,
                    message="",
                )
            case "wifi":
                rpi_status[item.dancer].wifi = InterfaceStatus(
                    name=item.dancer,
                    IP=item.IP,
                    MAC=item.MAC,
                    connected=item.connected,
                    statusCode=0,
                    message="",
                )
    set_RPi_props_from_state()


def read_command_response(data: FromControllerServerCommandResponse):
    payload = data.payload
    dancer = payload.dancer
    command = payload.command
    message = payload.message
    rpi_status = state.rpi_status
    if dancer not in state.rpi_status:
        rpi_status[dancer] = RPiStatusItem(
            ethernet=InterfaceStatus(
                name=dancer, IP="", MAC="", connected=False, statusCode=0, message=""
            ),
            wifi=InterfaceStatus(
                name=dancer, IP="", MAC="", connected=False, statusCode=0, message=""
            ),
        )
    rpi_status_item = rpi_status[dancer]
    if rpi_status_item.ethernet.connected:
        rpi_status_item.ethernet.message = f"[{command}] {message}"
        rpi_status_item.ethernet.statusCode = data.statusCode
    if rpi_status_item.wifi.connected:
        rpi_status_item.wifi.message = f"[{command}] {message}"
        rpi_status_item.wifi.statusCode = data.statusCode
    shell_history = state.shell_history
    if dancer not in shell_history:
        shell_history[dancer] = []
    shell_history[dancer].append(ShellTransaction(command=command, output=message))
    set_RPi_props_from_state()
