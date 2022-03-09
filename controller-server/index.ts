import express from "express";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";

import DancerSocket from "./test_websocket/dancerSocket";
// import ControlPanelSocket from "./websocket/controlPanelSocket";
import ControlPanelSocket from "./test_websocket/controlPanelSocket";
import { Dic, ClientType, MesC2S, MesS2C, InfoType } from "./types/index";
import NtpServer from "./ntp/index";

import { createRequire } from "module";
// const require = createRequire(import.meta.url);
// const board_config = require("../files/data/board_config.json");
import * as board_config_data from "../files/data/board_config.json";
import { ClientAgent } from "./clientAgent";
const board_config = board_config_data as Dic;
import { CommandType } from "./constants";
import { client } from "websocket";
console.log(board_config);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ntpServer = new NtpServer(); // ntp server for sync time

const clientAgent = new ClientAgent();

// websocket
wss.on("connection", (ws) => {
  ws.onmessage = (msg: any) => {
    // need to consider further type assignment
    const parsedData: MesC2S = JSON.parse(msg.data);
    const { command, payload } = parsedData;
    console.log("Client response: ", command, "\nPayload: ", payload);

    // We defined that the first task for clients (dancer and editor) will be boardInfo
    // This can then let us split the logic between dancerClients and editorClients
    if (command === CommandType.BOARDINFO) {
      const { type, name: hostName } = payload as InfoType;
      // check type : rpi or controlpanel

      // rpi
      switch (type) {
        case ClientType.RPI: {
          // check if `dancer` type's hostname is in board_config.json
          if (hostName in board_config) {
            const { dancerName } = board_config[hostName];

            // socket connection established
            const dancerSocket = new DancerSocket(ws, dancerName, clientAgent);
            dancerSocket.handleMessage();

            // response
            Object.values(clientAgent.controlPanelClients.getClients()).forEach(
              (controlPanel) => {
                const ws = controlPanel.ws;
                // render dancer's info at frontend
                const dancerIPs = clientAgent.dancerClients.getClientsIP();
                const name = JSON.stringify(Object.keys(dancerIPs));
                const ip = JSON.stringify(Object.values(dancerIPs));
                const res: MesS2C = {
                  command: CommandType.BOARDINFO,
                  payload: {
                    success: true,
                    info: {
                      type: ClientType.RPI,
                      name,
                      ip,
                    },
                  },
                };
                ws.send(JSON.stringify(res));
              }
            );
          } else {
            // `dancer` type's hostName is not in board_config
            console.error(
              `'dancer' type board connected, but not found hostname in board_config`
            );
          }
          break;
        }

        // controlpanel
        case ClientType.CONTROLPANEL: {
          const controlPanelName = hostName; // send from controlPanelSocketAPI

          // socket connection established
          const controlPanelSocket = new ControlPanelSocket(
            ws,
            controlPanelName,
            clientAgent
          );
          controlPanelSocket.handleMessage();

          // response
          Object.values(clientAgent.controlPanelClients.getClients()).forEach(
            (controlPanel) => {
              const ws = controlPanel.ws;
              // render dancer's info at frontend
              const dancerIPs = clientAgent.dancerClients.getClientsIP();
              const name = JSON.stringify(Object.keys(dancerIPs));
              const ip = JSON.stringify(Object.values(dancerIPs));
              const res: MesS2C = {
                command: CommandType.BOARDINFO,
                payload: {
                  success: true,
                  info: {
                    type: ClientType.RPI,
                    name,
                    ip,
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
          console.error(`Invalid type ${type} on connection`);
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
