class WebSocketAPI {
  constructor() {
    this.ws = null;
  }

  init(location, api) {
    const ws = new WebSocket(location);
    ws.onmessage = function (e) {
      console.log(e);
      api(e);
    };
    this.ws = ws;
  }
}

export default WebSocketAPI;
