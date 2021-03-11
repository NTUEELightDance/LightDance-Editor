const WebSocket = require("ws");

class WebSocketApp {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
  }

  listen() {
    this.wss.on("connection", (ws) => {
      console.log("Client connected");
      ws.send("Hello");

      ws.on("close", () => {
        console.log("Close connected");
      });
    });
  }

  handleSync(action) {
    console.log(action);
    this.wss.clients.forEach((client) => {
      console.log(client.readyState === WebSocket.OPEN);
      client.send(action);
    });
  }

  handleRpiResponse() {
    this.wss.clients.forEach((client) => {
      client.onmessage = (message) => {
        const [task, payload] = JSON.parse(message.data);
        console.log(`Command Server response: ${task}\nPayload: ${payload}`);

        switch (task) {
          case "boardInfo":
            // destructure payload and write board_config.json
            break;
          default:
            break;
        }
      };
    });
  }
}

module.exports = WebSocketApp;
