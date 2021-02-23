const WebSocket = require("ws");

class WebSocketApp {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    console.log(this.wss);
  }

  listen() {
    this.wss.on("connection", (ws) => {
      console.log("Client connected");
      ws.send("Hello");
      this.handleSync();
      ws.on("close", () => {
        console.log("Close connected");
      });
    });
  }

  handleSync(action) {
    console.log(action);
    this.wss.clients.forEach((client) => {
      console.log(client.readyState === WebSocket.OPEN);
      client.send("data");
      //   ws.send(JSON.stringify(action));
    });
  }
}

module.exports = WebSocketApp;
