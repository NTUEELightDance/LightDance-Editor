import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
// apollo
import client from "./client";

import WaveSurferAppContext from "./contexts/WavesurferContext";
import LayoutContextProvider from "./contexts/LayoutContext";

import App from "./App";

import "./index.css";

import { ApolloProvider } from "@apollo/client";

const Index = () => (
  <ApolloProvider client={client}>
    <WaveSurferAppContext>
      <Provider store={store}>
        <LayoutContextProvider>
          <App />
        </LayoutContextProvider>
      </Provider>
    </WaveSurferAppContext>
  </ApolloProvider>
);

const root = ReactDOM.createRoot(document.getElementById("app")!);
root.render(<Index />);
