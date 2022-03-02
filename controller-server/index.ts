/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
/* eslint-disable global-require */
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";

import DancerSocket from "./test_websocket/dancerSocket";
import EditorSocket from "./websocket/editorSocket";

import NtpServer from "./ntp/index";

import { createRequire } from "module";
import COMMANDS from "./constants/index";
import { TargetClientList, Dic } from "./type/index";
// const require = createRequire(import.meta.url);
// const board_config = require("../files/data/board_config.json");
import * as board_config_data from "../files/data/board_config.json"
const board_config = board_config_data as Dic
// const board_config: any = []

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// const ntpServer = new NtpServer(); // ntp server for sync time

const dancerClients: TargetClientList = {};
const editorClients: TargetClientList = {};

/**
 * handle all message received from webSocket, and emit to other sockets
 * Ex. message from RPi's webSocket => emit message to editor's websocket
 * Ex. message from Editor's webSocket => emit to RPi (performance) or emit to other editor (multi editing)
 * @param {string} from - from who
 * @param {{ type, task, payload }} msg
 */
const socketReceiveData = (from: string, msg: any) => {  // msg type need to be specified later 
  const { type, task, payload } = msg;
  switch (type) {
    case "dancer": {
      Object.values(editorClients).forEach((editor: any) => { // editor is of type editor socket
        editor.sendDataToClientEditor([
          task,
          {
            from,
            response: payload,
          },
        ]);
      });
      break;
    }
    case "Editor": {
      break;
    }
    default:
      break;
  }

  console.log("dancerClients: ", Object.keys(dancerClients));
  console.log("editorClients: ", Object.keys(editorClients));
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
// EditorClientsAgent: to handle add or delete someone in editorClients
const EditorClientsAgent = {
  addEditorClient: (editorName: string, editorSocket: any) => { // editorSocket is of type EditorSocket
    editorClients[editorName] = editorSocket;
  },
  deleteEditorClient: (editorName: string) => {
    delete editorClients[editorName];
  },
  socketReceiveData,
};


// websocket
wss.on("connection", (ws) => {
  ws.onmessage = (msg: any) => { // need to consider further type assignment
    const [task, payload] = JSON.parse(msg.data);
    console.log("Client response: ", task, "\nPayload: ", payload);

    // We defined that the first task for clients (dancer and editor) will be boardInfo
    // This can then let us split the logic between dancerClients and editorClients
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

          Object.values(editorClients).forEach((editor) => {
            const ws = editor.ws;
            // render dancer's info at frontend
            ws.send(JSON.stringify(["getIp", { dancerClients }]));
          });
        } else {
          // `dancer` type's hostName is not in board_config
          console.error(
            `'dancer' type board connected, but not found hostname in board_config`
          );
        }
      } else if (type === "editor") {
        const editorName = hostName; // send from editorSocketAPI

        const editorSocket = new EditorSocket(
          ws,
          editorName,
          EditorClientsAgent,
          DancerClientsAgent
        );

        editorSocket.handleMessage();

        ws.send(JSON.stringify(["getIp", { dancerClients }])); // render dancer's info at frontend
      } else {
        console.error(`Invalid type ${type} on connection`);
      }
    }
  };
});

app.set("wss", wss);

app.use(bodyParser.json({ limit: "20mb" }));

// router api for rpi and dancers
app.post("/api/controller/:command", (req, res) => {
  const { command } = req.params;
  const { selectedDancers, args } = req.body;

  selectedDancers.forEach((dancerName: string) => {
    dancerClients[dancerName].methods[command](args);
  });

  // // for editor play, pause stop
  // Object.values(editorClients).map(
  //   (ec) => ec.methods[command] && ec.methods[command](args)
  // );

  res.status(200).send(command);
});

const port = process.env.PORT || 8082;

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
