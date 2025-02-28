import json

from ..types import FromControllerServerBoardInfo, FromControllerServerCommandResponse
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
        case "command":
            data = FromControllerServerCommandResponse.from_json(msg)
        case _:
            print("Invalid message topic")
