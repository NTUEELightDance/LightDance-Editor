import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
// test for websocket
import WebSocketContext from "./contexts/WebSocketContext";
import WaveSurferAppContext from "./contexts/WavesurferContext";
import LayoutContextProvider from "./contexts/LayoutContext";

import App from "./app";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
  },
});
const authLink = setContext((_, { headers }) => {
  // // get the authentication token from local storage if it exists
  // const token = localStorage.getItem("token");
  // // return the headers to the context so httpLink can read them
  return {
    headers: {
      userID: 1234,
      name: "editor",
    },
  };
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);
const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache().restore({}),
});
const Index = () => (
  <ApolloProvider client={client}>
    <Provider store={store}>
      <WebSocketContext>
        <WaveSurferAppContext>
          <LayoutContextProvider>
            <App />
          </LayoutContextProvider>
        </WaveSurferAppContext>
      </WebSocketContext>
    </Provider>
  </ApolloProvider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
