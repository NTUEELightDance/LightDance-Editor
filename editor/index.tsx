import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";

// test for websocket
import WebSocketContext from "./contexts/WebSocketContext";
import WaveSurferAppContext from "./contexts/WavesurferContext";
import LayoutContextProvider from "./contexts/LayoutContext";

import App from "./app";

const Index = () => (
  <Provider store={store}>
    <WebSocketContext>
      <WaveSurferAppContext>
        <LayoutContextProvider>
          <App />
        </LayoutContextProvider>
      </WaveSurferAppContext>
    </WebSocketContext>
  </Provider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
