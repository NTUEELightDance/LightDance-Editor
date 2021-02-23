import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

import App from "./app";

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onmessage = function (e) {
  console.log(e.data);
};

const Index = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
