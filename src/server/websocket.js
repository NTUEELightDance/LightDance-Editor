const Websocket = require("ws");
const fs = require("fs");
const os = require("os");

class ClientSocket {
  constructor() {
    this.wsClient = null;
    this.cmdFromServer = null;
    // ============== test =============
    this.statusBar = {
      dancer0: {
        msg: "",
      },
      dancer1: {
        msg: "",
      },
    };
    // ============== test =============

    this.init();
  }

  init() {
    this.connectWebsocket();
  }

  sendDataToServer(data) {
    this.wsClient.send(JSON.stringify(data));
  }

  connectWebsocket() {
    this.wsClient = new Websocket("ws://localhost:4000");
    if (this.wsClient.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        this.init();
      }, 3000);
    } else this.listeningServer();
  }

  parseServerData(data) {
    const [task, payload] = JSON.parse(data);
    this.cmdFromServer = task;

    const { from, msg } = payload;
    // update statusBar
    this.statusBar[from].msg = msg; // test
  }

  listeningServer() {
    this.wsClient.onopen = () => {
      this.connectedBefore = true;
      console.log("Websocket connected.");
      this.sendDataToServer([
        "boardInfo",
        {
          hostname: os.hostname(),
          type: "commandClient",
        },
      ]);
    };
    this.wsClient.onerror = (err) => {
      console.log(`Websocket error: ${err.message}`);
    };
    this.wsClient.onmessage = (msg) => {
      const data = msg.data;
      console.log(`Data from server: ${data}`);
      this.parseServerData(data);
    };
    this.wsClient.onclose = (e) => {
      console.log("Websocket client closed.");
    };
  }
}

module.exports = ClientSocket;
