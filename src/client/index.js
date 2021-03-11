import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

// test for websocket
import WebSocketContext from "./webSocketContext";

import App from "./app";

const Index = () => (
  <WebSocketContext>
    <Provider store={store}>
      <App />
    </Provider>
  </WebSocketContext>
);

ReactDOM.render(<Index />, document.getElementById("app"));
