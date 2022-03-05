/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable global-require */
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";

import DancerSocket from "./test_websocket/dancerSocket";
// import ControlPanelSocket from "./websocket/controlPanelSocket";
import ControlPanelSocket from "./test_websocket/controlPanelSocket";
import { Dic, dancerClientDic, controlPanelClientDic } from "./types";
import NtpServer from "./ntp/index";

import { createRequire } from "module";
import COMMANDS from "./constants/index";
// const require = createRequire(import.meta.url);
// const board_config = require("../files/data/board_config.json");
import * as board_config_data from "../files/data/board_config.json"
const board_config = board_config_data as Dic

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const ntpServer = new NtpServer(); // ntp server for sync time

const dancerClients: dancerClientDic = {}
const controlPanelClients: controlPanelClientDic = {};

/**
 * handle all message received from webSocket, and emit to other sockets
 * Ex. message from RPi's webSocket => emit message to controlPanel's websocket
 * Ex. message from ControlPanel's webSocket => emit to RPi (performance) or emit to other controlPanel (multi editing)
 * @param {string} from - from who
 * @param {{ type, task, payload }} msg
 */
const socketReceiveData = (from: string, msg: any) => {  // msg type need to be specified later 
  const { type, task, payload } = msg;
  switch (type) {
    case "dancer": {
      Object.values(controlPanelClients).forEach((controlPanel: ControlPanelSocket) => {
        //   TODO: modify the argument data format to meet the data type SocketMes

        //   controlPanel.sendDataToClientControlPanel([
        //     task,
        //     {
        //       from,
        //       response: payload,
        //     },
        //   ]);
      });
      break;
    }
    case "controlPanel": {
      break;
    }
    default:
      break;
  }

  console.log("dancerClients: ", Object.keys(dancerClients));
  console.log("controlPanelClients: ", Object.keys(controlPanelClients));
};

// DancerClientsAgent: to handle add or delete someone in dancerClients
const DancerClientsAgent = {
  addDancerClient: (dancerName: string, dancerSocket: any) => { // dancerSocket is of type DancerSocket
    dancerClients[dancerName] = dancerSocket;
  },
  deleteDancerClient: (dancerName: string) => {
    delete dancerClients[dancerName];
  },
  getDancerClients: () => {
    return dancerClients;
  },
  socketReceiveData,
};
// ControlPanelClientsAgent: to handle add or delete someone in controlPanelClients
const ControlPanelClientsAgent = {
  addControlPanelClient: (controlPanelName: string, controlPanelSocket: ControlPanelSocket) => {
    controlPanelClients[controlPanelName] = controlPanelSocket;
  },
  deleteControlPanelClient: (controlPanelName: string) => {
    delete controlPanelClients[controlPanelName];
  },
  socketReceiveData,
};


// websocket
wss.on("connection", (ws) => {
  ws.onmessage = (msg: any) => { // need to consider further type assignment
    const [task, payload] = JSON.parse(msg.data);
    console.log("Client response: ", task, "\nPayload: ", payload);

    // We defined that the first task for clients (dancer and controlPanel) will be boardInfo
    // This can then let us split the logic between dancerClients and controlPanelClients
    if (task === "boardInfo") {
      const { type } = payload;
      const hostName = payload.name;
      if (type === "dancer") {
        // check if `dancer` type's hostname is in board_config.json
        if (hostName in board_config) {
          const { dancerName } = board_config[hostName];
          // ask about dancerClient
          const dancerSocket = new DancerSocket(
            ws,
            dancerName,
            DancerClientsAgent
          );
          dancerSocket.handleMessage();

          Object.values(controlPanelClients).forEach((controlPanel) => {
            const ws = controlPanel.ws;
            // render dancer's info at frontend
            ws.send(JSON.stringify(["getIp", { dancerClients }]));
          });
        } else {
          // `dancer` type's hostName is not in board_config
          console.error(
            `'dancer' type board connected, but not found hostname in board_config`
          );
        }
      } else if (type === "controlPanel") {
        const controlPanelName = hostName; // send from controlPanelSocketAPI

        const controlPanelSocket = new ControlPanelSocket(
          ws,
          controlPanelName,
          ControlPanelClientsAgent,
          DancerClientsAgent
        );

        controlPanelSocket.handleMessage();

        ws.send(JSON.stringify(["getIp", { dancerClients }])); // render dancer's info at frontend
      } else {
        console.error(`Invalid type ${type} on connection`);
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
