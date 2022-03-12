import express from "express";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";

import DancerSocket from "./test_websocket/dancerSocket";
// import ControlPanelSocket from "./websocket/controlPanelSocket";
import ControlPanelSocket from "./test_websocket/controlPanelSocket";
import { ClientType, MesC2S, MesS2C, InfoType } from "./types/index";
import NtpServer from "./ntp/index";

import { ClientAgent } from "./clientAgent";
import { CommandType } from "./constants";

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
    console.log(
      "[Message] Client response: ",
      command,
      "\n[Message] Payload: ",
      payload,
      "\n"
    );

    // We defined that the first task for clients (dancer and editor) will be boardInfo
    // This can then let us split the logic between dancerClients and editorClients
    if (command === CommandType.BOARDINFO) {
      // check type : rpi or controlpanel

      const { type } = payload as InfoType;
      // rpi
      switch (type) {
        case ClientType.RPI: {
          // check if `dancer` type's hostname is in board_config.json
          const { dancerName, hostName, ip } = payload as InfoType;

          // socket connection established
          const dancerSocket = new DancerSocket(
            ws,
            dancerName,
            hostName,
            clientAgent,
            ip
          );
          dancerSocket.handleMessage();

          // response
          Object.values(clientAgent.controlPanelClients.getClients()).forEach(
            (controlPanel) => {
              const ws = controlPanel.ws;
              // render dancer's info at frontend
              const dancerInfo = clientAgent.dancerClients.getClientsInfo();

              const res: MesS2C = {
                command: CommandType.BOARDINFO,
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
                command: CommandType.BOARDINFO,
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
          console.error(`Invalid type ${type} on connection`);
          const res: MesS2C = {
            command: CommandType.BOARDINFO,
            payload: {
              success: false,
              info: "invalid type",
            },
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
