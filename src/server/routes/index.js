// TODO need to merge with app.js

const express = require("express");

const Websocket = require("ws");

const { COMMANDS } = require("../../constant");

const router = express.Router();

const EditorSocket = require("../websocket/editorSocket");

// to merge from Rpi
// import DancerSocket from "./dancerSocket"

// store ws from editors and dancers
const dancerClients = {};
const editorClients = {};

const socketReceiveData = (from, msg) => {
  const { type, task, payload } = msg;
  switch (type) {
    case "Rpi":
      // task from RPi => to all editorClients
      Object.values(editorClients).forEach((editor) => {
        editor.sendDataToClientEditor([
          task,
          {
            from,
            response: {
              OK: payload.OK,
              msg: payload.msg,
            },
          },
        ]);
      });
      break;

    case "Editor":
      // task from editorClients
      // multi Editor => to all the other editorClients
      break;

    default:
      break;
  }
};

const DancerSocketAgent = {
  addDancerClient: (dancerName, dancerSocket) => {
    dancerClients[dancerName] = dancerSocket;
  },
  deleteDancerClient: (dancerName) => {
    delete dancerClients[dancerName];
  },
  socketReceiveData,
};

const EditorSocketAgent = {
  addEditorClient: (editorName, editorSocket) => {
    editorClients[editorName] = editorSocket;
  },
  deleteEditorClient: (editorName) => {
    delete editorClients[editorName];
  },
  socketReceiveData,
};

wss.on("connection", (ws) => {
  ws.onmessage = (msg) => {
    const [task, payload] = JSON.parse(msg.data);
    if (task === "boardInfo") {
      const { hostname } = payload;
      if (true) {
        // TODO import board_config to check dancer's name

        // get dancerName from hostname
        const dancerName = "test_dancer"; // test

        // ask about dancerClient
        const dancerSocket = new DancerSocket(
          ws,
          dancerName,
          DancerSocketAgent
        );
        dancerSocket.handleMessage();
      }
    } else if (task === "editor") {
      const editorName = "test_editor"; // test

      const editorSocket = new EditorSocket(ws, editorName, EditorSocketAgent);
      editorSocket.handleMessage();
    }
  };
});

// Handle command post
COMMANDS.forEach((command) => {
  switch (command) {
    case "play":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);
        const { startTime, whenToPlay, selectedDancers } = req.body;

        selectedDancers.forEach((dancerName) => {
          selectedDancers[dancerName].play(startTime, whenToPlay);
        });
        res.send(command);
      });
      break;
    case "uploadControl":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { controlJson, selectedDancers } = req.body;

        selectedDancers.forEach((dancerName) => {
          selectedDancers[dancerName].uploadControl(controlJson);
        });
        res.send(command);
      });
      break;
    case "uploadLed":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { ledData, selectedDancers } = req.body;

        selectedDancers.forEach((dancerName) => {
          selectedDancers[dancerName].uploadLed(ledData);
        });
        res.send(command);
      });
      break;
    case "lightCurrentStatus":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { lightCurrentStatus, selectedDancers } = req.body;

        selectedDancers.forEach((dancerName) => {
          selectedDancers[dancerName].lightCurrentStatus(lightCurrentStatus);
        });
        res.send(command);
      });
      break;
    default:
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { selectedDancers } = req.body;
        selectedDancers.forEach((dancerName) => {
          // eslint-disable-next-line no-new-func
          Function(`"use strict";dancerClients[${dancerName}].${command}()`)();
        });
        // Function(`"use strict";routerSocket.${command}()`)();  // not a great one, but don't want to write one by one XD
        res.send(command);
      });
      break;
  }
});

module.exports = router;
