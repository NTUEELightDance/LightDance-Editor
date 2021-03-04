const express = require("express");
const fs = require("fs");

const loginRouter = require("./login");
const syncRouter = require("./sync");
const fetchRouter = require("./fetch");
const branchRouter = require("./branch");
const registerRouter = require("./register");
const uploadRouter = require("./upload");
// constants
const { COMMANDS } = require("../../constant");

// import rpi socket api
// const routerSocket = require("routerSocket")

const router = express.Router();

// Handle register post
router.use("/register", registerRouter);

// Handle login post
router.use("/login", loginRouter);

// Handle sync post
router.use("/sync", syncRouter);

// Handle fetcg get
router.use("/fetch", fetchRouter);

// Handle fetcg get
router.use("/branch", branchRouter);

// Handle fetcg get
router.use("/upload", uploadRouter);

// Handle command post
COMMANDS.forEach((command) => {
  switch (command) {
    case "play":
      router
        .route(`/${command}`)
        .post(express.urlencoded({ extended: false }), (res, req) => {
          console.log(command); // for test
          const { startTime, whenToPlay } = req.body;
          // routerSocket.play(startTime, whenToPlay);
          res.send(command);
        });
      break;
    case "uploadControl":
      router.route(`/${command}`).post((res, req) => {
        console.log(command); // for test

        // const  controlJson = fs.readFileSync('control.json');
        // const control = JSON.parse(controlJson);
        // routerSocket.uploadControl(control);
        res.send(command);
      });
      break;
    case "uploadLed":
      router
        .route(`/${command}`)
        .post(express.urlencoded({ extended: false }), (res, req) => {
          console.log(command); // for test

          const { ledData } = req.body;
          // routerSocket.uploadLed(ledData);
          res.send(command);
        });
      break;
    case "lightCurrentStatus":
      router.route(`/${command}`).post((res, req) => {
        console.log(command); // for test

        // const  statusJson = fs.readFileSync('status.json');
        // const status = JSON.parse(statusJson);
        // routerSocket.lightCurrentStatus(status);
        res.send(command);
      });
      break;
    default:
      router.route(`/${command}`).post((res, req) => {
        console.log(command); // for test

        // Function(`"use strict";routerSocket.${command}()`)();  // not a great one, but don't want to write one by one XD
        res.send(command);
      });
      break;
  }
});

module.exports = router;
