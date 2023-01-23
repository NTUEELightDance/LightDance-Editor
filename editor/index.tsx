import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
// apollo
import client from "./client";

import WaveSurferAppContext from "./contexts/WavesurferContext";

import Router from "./pages";

import "./index.css";

import { ApolloProvider } from "@apollo/client";

function Index() {
  return (
    <ApolloProvider client={client}>
      <WaveSurferAppContext>
        <Provider store={store}>
          <Router />
        </Provider>
      </WaveSurferAppContext>
    </ApolloProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<Index />);
