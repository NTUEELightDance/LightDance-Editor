import WebSocket, { WebSocketServer } from "ws";

import { hadndleOnRPiMessage, hadndleOnControlPanelMessage } from "@/websocket";
import { Message } from "./types/global";

const webSocketConfig = {
  port: 8082,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
};

const wss = new WebSocketServer(webSocketConfig);

console.log(`Listening on port: ${webSocketConfig.port}`);
wss.on("connection", function connection(ws: WebSocket) {
  ws.on("message", function message(data: Buffer) {
    // Parse incomping message to object
    const msg: Message = JSON.parse(data.toString());

    console.log(msg);
    // Handle message according to type of the message payload
    switch (msg.from) {
      case "RPi":
        hadndleOnRPiMessage(ws, msg);
        break;
      case "controlPanel":
        hadndleOnControlPanelMessage(ws, msg);
        break;
      default:
        console.error(`[Error]: Invalid message ${msg}`);
        break;
    }
  });

  ws.on("error", console.error);
});
