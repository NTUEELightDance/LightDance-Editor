import json

import websocket

WS_URL = "ws://localhost:8082"


class API:  # TODO
    def __init__(self):
        self.ws = websocket.WebSocketApp(
            WS_URL,
            on_message=self.on_message,
            on_error=self.on_error,
            on_close=self.on_close,
        )

    def on_message(self, ws: websocket.WebSocket, message):
        print(message)

    def on_error(self, ws: websocket.WebSocket, error):
        print(error)

    def on_close(self, ws: websocket.WebSocket, close_status_code, close_msg):
        print("### closed ###")

    def send(self, payload: dict):
        self.ws.send(json.dumps(payload))


if __name__ == "__main__":
    api = API()
