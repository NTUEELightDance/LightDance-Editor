import json
import time

from ..types import (
    DancerStatus,
    FromControllerServerBoardInfo,
    FromControllerServerCommandResponse,
)
from ..types.app import LightDanceAppType
from ..utils.convert import update_dancer_status_from_board_info


def on_message(msg: str, app_ref: LightDanceAppType):
    data_dict: dict = json.loads(msg)
    match data_dict["topic"]:
        case "boardInfo":
            data = FromControllerServerBoardInfo.from_json(msg)
            if isinstance(data, list):
                print("Invalid board data")
                return
            app_ref.dancer_status = update_dancer_status_from_board_info(
                data, app_ref.dancer_status
            )
        case "command":  # TODO: Test this
            data = FromControllerServerCommandResponse.from_json(msg)
            if isinstance(data, list):
                app_ref.notify("Invalid command response", severity="warning")
                return
            app_ref.notify(
                f"[{data.payload.dancer}:{data.payload.command}]{data.payload.message}"
            )
            app_ref.log_instance.write(
                f"{time.strftime('%H:%M:%S')} {data.payload.dancer}:{data.payload.command}({data.statusCode}) - {data.payload.message}"
            )
            new_dancer_status = app_ref.dancer_status
            new_dancer_status[data.payload.dancer].response = data.payload.message
            app_ref.dancer_status = DancerStatus(
                new_dancer_status
            )  # FIXME: Not working
        case _:
            app_ref.notify("Invalid message topic", severity="warning")
