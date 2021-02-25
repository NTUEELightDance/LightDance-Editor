import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

import App from "./app";

import { syncStatus, syncPos } from "./slices/globalSlice";

const ws = new WebSocket(`ws://${window.location.host}`);

ws.onmessage = function (e) {
  const { mode, type } = JSON.parse(e.data);
  if (mode === "EDIT") {
    if (type === "control") {
      store.dispatch(syncStatus(JSON.parse(e.data)));
    }
    if (type === "position") {
      store.dispatch(syncPos(JSON.parse(e.data)));
    }
  }
  if (mode === "ADD") {
    if (type === "control") {
      store.dispatch(syncStatus(JSON.parse(e.data)));
    }
    if (type === "position") {
      store.dispatch(syncPos(JSON.parse(e.data)));
    }
  }
};

const Index = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
