import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
// apollo
import client from "./client";

// test for websocket
import WebSocketContext from "./contexts/WebSocketContext";
import WaveSurferAppContext from "./contexts/WavesurferContext";
import LayoutContextProvider from "./contexts/LayoutContext";

import App from "./app";

import { ApolloProvider } from "@apollo/client";

const Index = () => (
  <ApolloProvider client={client}>
    <WebSocketContext>
      <WaveSurferAppContext>
        <Provider store={store}>
          <LayoutContextProvider>
            <App />
          </LayoutContextProvider>
        </Provider>
      </WaveSurferAppContext>
    </WebSocketContext>
  </ApolloProvider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
