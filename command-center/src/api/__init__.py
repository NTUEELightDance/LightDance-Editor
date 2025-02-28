import json
import time
from collections.abc import Callable

import websocket
from textual.widgets import Log

from ..types.app import LightDanceAppType
from .message import on_message

WS_URL = "ws://localhost:8082"


class API:
    ws: websocket.WebSocketApp | None = None
    app_ref: LightDanceAppType
    log: Callable[[str], Log]

    def set_app_ref(self, app: LightDanceAppType):
        self.app_ref = app

    def connect(self):
        self.app_ref.notify(f"Connecting to {WS_URL}")
        while True:
            try:
                self.ws = websocket.WebSocketApp(
                    WS_URL,
                    on_message=self.on_message,
                    on_error=self.on_error,
                    on_close=self.on_close,
                    on_open=self.on_open,
                )
                self.ws.run_forever()
                time.sleep(1)
            except websocket.WebSocketException:
                self.app_ref.notify("Connection error. Retrying...")
                self.ws = None
            except KeyboardInterrupt:
                self.app_ref.notify("Exiting...")
                break

    def on_message(self, ws, message):
        on_message(message, self.app_ref)

    def on_error(self, ws, error):
        print(f"Error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        self.app_ref.notify(
            f"Connection closed with code {close_status_code}", severity="error"
        )

    def on_open(self, ws):
        assert self.ws
        self.app_ref.notify("Connection opened")
        self.send(
            {
                "topic": "boardInfo",
            }
        )

    def send(self, message: dict):
        if self.ws is None:
            self.app_ref.notify("Connection is not open")
            return
        self.ws.send(
            json.dumps(
                {
                    **message,
                    "from": "controlPanel",
                    "statusCode": 0,
                }
            )
        )


api = API()
