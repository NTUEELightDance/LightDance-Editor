import { createServer } from "http";
import { dancerToMAC } from "@/configs/dancerTable";
import * as dotenv from "dotenv";
dotenv.config();

import WebSocket, { WebSocketServer } from "ws";
import express from "express";

import createNTPServer from "@/ntp";

import { handleOnRPiMessage, handleOnControlPanelMessage } from "@/websocket";
import { Message } from "@/types/global";
import { ToRPiSync } from "@/types/RPiMessage";
import { sendBeatToRPi } from "@/websocket/RPi/handlers";
import pinMapTable from "./configs/pinMapTable";

const { SERVER_HOSTNAME, SERVER_PORT, NTPSERVER_PORT } = process.env;

if (!SERVER_HOSTNAME) {
  throw new Error("SERVER_HOSTNAME is not defined");
}
if (!SERVER_PORT) {
  throw new Error("SERVER_PORT is not defined");
}

if (!NTPSERVER_PORT) {
  throw new Error("NTPSERVER_PORT is not defined");
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", function connection(ws: WebSocket) {
  console.log("[Connected]");
  ws.on("message", function message(data: Buffer) {
    // Parse incoming message to object
    let msg: Message | null = null;
    try {
      msg = JSON.parse(data.toString());
      console.log("[Received]:", msg, "\n");
    } catch (error) {
      console.error(`[Error]: ${error}`);
    }
    if (msg === null) return;

    // Handle message according to type of the message payload
    switch (msg.from) {
      case "RPi":
        handleOnRPiMessage(ws, msg);
        break;
      case "controlPanel":
        handleOnControlPanelMessage(ws, msg);
        break;
      default:
        console.error(`[Error]: Invalid message ${msg}`);
        break;
    }
  });

  ws.on("error", console.error);
});

setInterval(() => {
  const toRPiMsg: ToRPiSync = {
    from: "server",
    topic: "sync",
    statusCode: 0,
    payload: "",
  };
  sendBeatToRPi(Object.keys(dancerToMAC), toRPiMsg);
}, 5000);

createNTPServer(parseInt(NTPSERVER_PORT));

server.listen(SERVER_PORT, () => {
  console.log(
    `[TCP Server] Controller Server is listening on port ${SERVER_PORT}\n`,
  );
});

app.get("/pinMapTable", (req, res) => {
  res.json(pinMapTable);
});
