import json
import time
from collections.abc import Callable
from typing import Literal

import websocket

WS_URL = "ws://localhost:8082"


class API:
    ws: websocket.WebSocketApp | None = None

    def set_notifier(self, notifier: Callable[..., None]):
        self.notify = notifier

    @staticmethod
    def notify(
        message: str,
        *,
        title: str = "",
        severity: Literal["information", "warning", "error"] = "information",
        timeout: float | None = None,
    ) -> None:
        """Show a notification.
        Using Staticmethod since it should be replaced by the actual textual `notify` function.
        """
        return

    def connect(self):
        self.notify(f"Connecting to {WS_URL}")
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
                self.notify("Connection error. Retrying...")
                self.ws = None
            except KeyboardInterrupt:
                self.notify("Exiting...")
                break

    def on_message(self, ws, message):
        print(f"Message: {message}")

    def on_error(self, ws, error):
        print(f"Error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        self.notify(
            f"Connection closed with code {close_status_code}", severity="error"
        )

    def on_open(self, ws):
        assert self.ws
        self.notify("Connection opened")
        self.send(
            {
                "topic": "boardInfo",
            }
        )

    def send(self, message: dict):
        if self.ws is None:
            self.notify("Connection is not open")
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
