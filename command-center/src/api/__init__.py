import json
import os
import time
from collections.abc import Callable

import requests
import websocket
from textual.widgets import Log

from ..config import DANCER_LIST, MODEL_PIN_MAP_TABLE
from ..types.app import LightDanceAppType
from ..utils.convert import update_dancer_status
from .message import on_message

HTTPS_URL = "https://lightdance-editor.ntuee.org/api/editor-server/"


class API:
    ws: websocket.WebSocketApp | None = None
    app_ref: LightDanceAppType
    log: Callable[[str], Log]

    def set_app_ref(self, app: LightDanceAppType):
        self.app_ref = app

    def get_dancers(self):
        data = None
        while not data:
            data = {}
            for dancer, type in DANCER_LIST:
                if type == "none":
                    continue
                data[dancer] = {"dancer": dancer, **MODEL_PIN_MAP_TABLE[type]}
        self.app_ref.dancer_status = update_dancer_status(self.app_ref.dancer_status)

    def get_pin_map(self):
        data = None
        while not data:
            data = {}
            for dancer, type in DANCER_LIST:
                if type == "none":
                    continue
                data[dancer] = {"dancer": dancer, **MODEL_PIN_MAP_TABLE[type]}
        self.app_ref.notify("Pin map loaded")
        self.app_ref.pinmap = data

    def download(self, dancers):
        current_dir = os.path.dirname(os.path.abspath(__file__))

        for dancer_id in dancers:
            payload = {
                "dancer": DANCER_LIST[dancer_id][0],
                "OFPARTS": MODEL_PIN_MAP_TABLE[DANCER_LIST[dancer_id][1]]["OFPARTS"],
                "LEDPARTS": MODEL_PIN_MAP_TABLE[DANCER_LIST[dancer_id][1]]["LEDPARTS"],
            }

            control_result_value = requests.post(
                f"{HTTPS_URL}/controlDat", json=payload
            )
            frame_result_value = requests.post(f"{HTTPS_URL}/frameDat", json=payload)

            files_to_save = [
                (f"control_{dancer_id-1}.dat", control_result_value.content),
                (f"frame_{dancer_id-1}.dat", frame_result_value.content),
            ]

            for file_name, data in files_to_save:
                try:
                    file_path = os.path.join(
                        current_dir, "..", "..", "..", "lighttable", file_name
                    )
                    file_path = os.path.abspath(file_path)

                    os.makedirs(os.path.dirname(file_path), exist_ok=True)

                    with open(file_path, "wb") as f:
                        f.write(data)
                    self.app_ref.control_table.update_cell(
                        DANCER_LIST[dancer_id][0],
                        "Response",
                        f"Data saved locally to {file_path}",
                    )

                except Exception as e:
                    self.app_ref.control_table.update_cell(
                        DANCER_LIST[dancer_id][0],
                        "Response",
                        f"Failed to save file locally: {e}",
                    )


api = API()
