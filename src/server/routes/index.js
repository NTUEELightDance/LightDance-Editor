const express = require("express");

const { COMMANDS } = require("../../constant");
const ClientSocket = require("../websocket");

const router = express.Router();
const socket = new ClientSocket();

// Handle command post
COMMANDS.forEach((command) => {
  switch (command) {
    case "play":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);
        const { startTime, whenToPlay } = req.body;
        // routerSocket.play(startTime, whenToPlay);
        res.send(command);
      });
      break;
    case "uploadControl":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { controlJson } = req.body;
        // routerSocket.uploadControl(control);
        res.send(command);
      });
      break;
    case "uploadLed":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { ledData } = req.body;
        // routerSocket.uploadLed(ledData);
        res.send(command);
      });
      break;
    case "lightCurrentStatus":
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        const { lightCurrentStatus } = req.body;

        // routerSocket.lightCurrentStatus(status);
        res.send(command);
      });
      break;
    default:
      router.route(`/${command}`).post((req, res) => {
        console.log(command); // for test
        console.log(req.body);

        // Function(`"use strict";routerSocket.${command}()`)();  // not a great one, but don't want to write one by one XD
        res.send(command);
      });
      break;
  }
});

router.route("/getStatusBar").post((req, res) => {
  res.send(socket.statusBar);
});

module.exports = router;
