const express = require("express");
const http = require("http");

const app = express();
const Websocket = require("ws");
const readline = require("readline");

const server = http.createServer(app);
const wss = new Websocket.Server({ server });

const port = 8080;

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

let testWs = null;
// websocket
wss.on("connection", (ws) => {
  testWs = ws;
  ws.onmessage = (msg) => {
    const [task, payload] = JSON.parse(msg.data);
    console.log("Client response: ", task, "\nPayload: ", payload);
  };
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  console.log(`Sending: ${input}`);
  switch (input) {
    case "play": {
      const whenToPlay = 0;
      const delay = 0;
      testWs.send(JSON.stringify(["play", { whenToPlay, delay }]));
      break;
    }
    case "pause": {
      testWs.send(JSON.stringify(["pause"]));
      break;
    }
    case "stop": {
      testWs.send(JSON.stringify(["stop"]));
      break;
    }
    case "uploadControl": {
      testWs.send(JSON.stringify(["uploadControl", testControl]));
      break;
    }
    case "lightCurrentStatus": {
      testWs.send(JSON.stringify(["lightCurrentStatus", testStatus]));
      break;
    }
    default:
      break;
  }
});

const testStatus = {
  LED_HANDLE: { src: "red_handle", alpha: 1 },
  LED_GUARD: { src: "red_guard", alpha: 1 },
  LED_SWORD: { src: "red_sword", alpha: 1 },
};

const testControl = [
  {
    start: 0,
    fade: false,
    status: {
      LED_HANDLE: { src: "bl_handle", alpha: 0 },
      LED_GUARD: { src: "bl_guard", alpha: 0 },
      LED_SWORD: { src: "bl_sword", alpha: 0 },
    },
  },
  {
    start: 2029,
    fade: false,
    status: {
      LED_HANDLE: { src: "red_handle", alpha: 1 },
      LED_GUARD: { src: "red_guard", alpha: 1 },
      LED_SWORD: { src: "red_sword", alpha: 1 },
    },
  },
  {
    start: 3077,
    fade: false,
    status: {
      LED_HANDLE: { src: "red_handle", alpha: 0 },
      LED_GUARD: { src: "red_guard", alpha: 0 },
      LED_SWORD: { src: "red_sword", alpha: 0 },
    },
  },
  {
    start: 4321,
    fade: true,
    status: {
      LED_HANDLE: { src: "red_handle", alpha: 1 },
      LED_GUARD: { src: "red_guard", alpha: 1 },
      LED_SWORD: { src: "red_sword", alpha: 1 },
    },
  },
  {
    start: 5826,
    fade: false,
    status: {
      LED_HANDLE: { src: "red_handle", alpha: 0 },
      LED_GUARD: { src: "red_guard", alpha: 0 },
      LED_SWORD: { src: "red_sword", alpha: 0 },
    },
  },
];
