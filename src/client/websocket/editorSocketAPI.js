/* eslint-disable class-methods-use-this */
import { updateDancerStatus } from "../slices/globalSlice";
import store from "../store";

class EditorSocketAPI {
  constructor() {
    this.ws = null;
    this.url = `ws://${window.location.host}`;
  }

  init() {
    this.ws = new WebSocket(this.url);
    if (this.ws.readyState !== WebSocket.CONNECTING) {
      setTimeout(() => {
        this.init();
      }, 3000);
      return;
    }
    this.ws.onopen = () => {
      console.log("Websocket for Editor Connected");
      this.sendDataToServer([
        "boardInfo",
        {
          type: "editor",
          name: location.hostname, // get hostname or something else
        },
      ]);

      this.ws.onerror = (err) => {
        console.log(`Editor's Websocket error : ${err.message} `);
      };

      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        console.log(`Data from server :${data}`);
        this.handleMessage(data);
      };

      this.ws.onclose = (e) => {
        console.log(`Websocket for Editor closed`);
      };
    };
  }

  sendDataToServer(data) {
    this.ws.send(JSON.stringify(data));
  }

  handleMessage(data) {
    const [task, payload] = data;

    switch (task) {
      case "boardInfo": {
        const {
          from,
          response: { OK, msg, ip },
        } = payload;
        console.log("IP:", ip);
        store.dispatch(
          updateDancerStatus({
            dancerName: from,
            newStatus: {
              OK,
              msg,
              ip,
            },
          })
        );
        break;
      }
      default:
        const {
          from,
          response: { OK, msg },
        } = payload;
        store.dispatch(
          updateDancerStatus({
            dancerName: from,
            newStatus: {
              OK,
              msg,
            },
          })
        );
        break;
    }
  }
}

export default EditorSocketAPI;
