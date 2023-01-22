import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { nanoid } from "nanoid";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const _userID = nanoid();

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${location.origin}/graphql-backend-websocket`.replace("http", "ws"),
    connectionParams: {
      userID: _userID,
      name: "editor",
    },
  })
);

import Subscriptions from "./subscription";

const httpLink = new HttpLink({
  uri: `${location.origin}/graphql-backend`,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
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
  connectToDevTools: process.env.NODE_ENV !== "production",
});

Subscriptions(client);

export default client;
