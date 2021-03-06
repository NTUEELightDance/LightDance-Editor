/* eslint-disable class-methods-use-this */
import store from "../store";

class EditorSocketAPI {
  constructor() {
    this.ws = null;
    this.url = `ws://${window.location.host}`;
  }

  init() {
    const ws = new WebSocket(this.url);
    ws.onmessage = (message) => {
      this.handleMessage(message.data);
    };
    this.ws = ws;
  }

  handleMessage(data) {
    const [task, payload] = data;
    const {
      from,
      response: { OK, msg },
    } = payload;

    console.log(data);
  }
}

export default EditorSocketAPI;
