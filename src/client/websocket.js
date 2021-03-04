import { syncPos, syncStatus, syncDelete } from "./slices/globalSlice";
import store from "./store";

class WebSocketAPI {
  constructor() {
    this.ws = null;
    this.url = `ws://${window.location.host}`;
  }

  init() {
    const ws = new WebSocket(this.url);

    ws.onmessage = (e) => {
      console.log(e);
      this.multiEditAgent(e);
    };
    this.ws = ws;
  }

  // eslint-disable-next-line class-methods-use-this
  multiEditAgent(e) {
    const { mode, type } = JSON.parse(e.data);
    if (mode === "EDIT" || mode === "ADD") {
      if (type === "control") {
        store.dispatch(syncStatus(JSON.parse(e.data)));
      }
      if (type === "position") {
        store.dispatch(syncPos(JSON.parse(e.data)));
      }
    }
    if (mode === "DEL") {
      console.log(JSON.parse(e.data));
      store.dispatch(syncDelete(JSON.parse(e.data)));
    }
  }
}

export default WebSocketAPI;
