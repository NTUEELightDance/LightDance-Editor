import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { nanoid } from "nanoid";
import Subscriptions from "./subscription";

const httpLink = new HttpLink({
  uri: `${location.origin}/graphql-backend`,
});

const _userID = nanoid();
const wsLink = new WebSocketLink({
  uri: `${location.origin}/graphql-backend-websocket`.replace("http", "ws"),
  options: {
    reconnect: true,
    connectionParams: {
      userID: _userID,
      name: "editor",
    },
  },
});
//randomly generate a unique ID
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      userID: _userID,
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
  connectToDevTools: true,
});

Subscriptions(client, _userID);

export default client;
