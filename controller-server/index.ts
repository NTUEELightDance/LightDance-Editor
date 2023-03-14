import express from "express";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";

import DancerSocket from "./websocket/dancerSocket";
// import ControlPanelSocket from "./websocket/controlPanelSocket";
import ControlPanelSocket from "./websocket/controlPanelSocket";
import { ClientType, MesC2S, MesS2C, MacAddrType, InfoType, MesR2S } from "./types/index";
import NtpServer from "./ntp/index";

import { ClientAgent } from "./clientAgent";
import { ActionType } from "./constants";
import { MAC_LIST } from "./constants/macList";

// Controller Server Database
import { ControlJsonDB } from "./database/dancerControlJson";
import { OfJsonDB } from "./database/dancerOF";
import { LedJsonDB } from "./database/dancerLED";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ntpServer = new NtpServer(); // ntp server for sync time

const clientAgent = new ClientAgent();

// websocket
wss.on("connection", (ws) => {
  ws.onmessage = (msg: any) => {
    // need to consider further type assignment
    const parsedData: MesC2S | MesR2S = JSON.parse(msg.data);
    const { command, payload } = parsedData;
    let type = null;
    console.log("[Message] Client response: ", command, "\n[Message] Payload: ", payload, "\n");

    // We defined that the first task for clients (dancer and editor) will be boardInfo
    // This can then let us split the logic between dancerClients and editorClients
    if (command === ActionType.BOARDINFO) {

      // fetch type, so ugly
      if ((<InfoType>payload).type) {
        type = (<InfoType>payload).type;
      }
      else if ((<MesR2S>parsedData).payload.info) {
        type = (<InfoType>((<MesR2S>parsedData).payload.info)).type;
      }

      console.log("[Type of Message]: ", type);
      // check type : rpi or control panel
      switch (type) {
      // rpi
      case ClientType.RPI: {
        // check if `dancer` type's hostname is in board_config.json
        const { macaddr } = (<MesR2S>parsedData).payload.info as MacAddrType;
        console.log("[Mac Address]: ", macaddr);
        const dancerName = MAC_LIST[macaddr][0];
        const hostName = MAC_LIST[macaddr][1];
        const ip = MAC_LIST[macaddr][2];
        // socket connection established
        const dancerSocket = new DancerSocket(
          ws,
          dancerName,
          hostName,
          clientAgent,
          ip
        );
        dancerSocket.handleMessage();

        // Send [control.json, OF.json, LED.json] back to RPi
        const dancerControlJson = ControlJsonDB[dancerName];
        const dancerOfJson = OfJsonDB[dancerName];
        const dancerLedJson = LedJsonDB[dancerName];
        dancerSocket.sendDataToRpiSocket({
          action: ActionType.UPLOAD,
          payload: [dancerControlJson, dancerOfJson, dancerLedJson]
        });

        // response
        Object.values(clientAgent.controlPanelClients.getClients()).forEach(
          (controlPanel) => {
            const ws = controlPanel.ws;
            // render dancer's info at frontend
            const dancerInfo = clientAgent.dancerClients.getClientsInfo();

            const res: MesS2C = {
              command: ActionType.BOARDINFO,
              payload: {
                success: true,
                info: {
                  type: ClientType.RPI,
                  dancerName: dancerInfo["dancerName"],
                  hostName: dancerInfo["hostName"],
                  ip: dancerInfo["ip"],
                },
              },
            };
            ws.send(JSON.stringify(res));
          }
        );

        break;
      }

      // controlpanel
      case ClientType.CONTROLPANEL: {
        // socket connection established
        const controlPanelSocket = new ControlPanelSocket(ws, clientAgent);
        controlPanelSocket.handleMessage();
        // response
        Object.values(clientAgent.controlPanelClients.getClients()).forEach(
          (controlPanel) => {
            const ws = controlPanel.ws;
            // render dancer's info at frontend
            const dancerInfo = clientAgent.dancerClients.getClientsInfo();

            const res: MesS2C = {
              command: ActionType.BOARDINFO,
              payload: {
                success: true,
                info: {
                  type: ClientType.RPI,
                  dancerName: dancerInfo["dancerName"],
                  hostName: dancerInfo["hostName"],
                  ip: dancerInfo["ip"],
                },
              },
            };
            ws.send(JSON.stringify(res));
          }
        );
        break;
      }

      // error
      default: {
        console.error("Invalid type ", type, " on connection");
        const res: MesS2C = {
          command: ActionType.BOARDINFO,
          payload: {
            success: false,
            info: "invalid type"
          }
        };
        ws.send(JSON.stringify(res));
      }
      }
    }
  };
});

app.set("wss", wss);

app.use(bodyParser.json({ limit: "20mb" }));

const port = process.env.PORT || 8082;

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
