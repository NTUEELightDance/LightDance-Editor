import * as dotenv from "dotenv";
dotenv.config();

import WebSocket, { WebSocketServer } from "ws";

import { hadndleOnRPiMessage, hadndleOnControlPanelMessage } from "@/websocket";
import { Message } from "@/types/global";

const { SERVER_HOSTNAME, SERVER_PORT } = process.env;

const wss = new WebSocketServer({
  host: SERVER_HOSTNAME,
  port: parseInt(SERVER_PORT as string, 10),
});

console.log(`Listening on: ${SERVER_HOSTNAME}:${SERVER_PORT}\n`);
wss.on("connection", function connection(ws: WebSocket) {
  ws.on("message", function message(data: Buffer) {
    // Parse incomping message to object
    const msg: Message = JSON.parse(data.toString());
    console.log("[Received]:", msg, "\n");

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
