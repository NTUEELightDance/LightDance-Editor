import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import Subscriptions from "./subscription";
import { state } from "@/core/state";
import { setControlMap } from "@/core/actions";
import { toControlMap, toPosMap } from "@/core/utils/convert";
import { setPosMap } from "@/core/actions/posMap";

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${location.origin}/graphql-backend-websocket`.replace("http", "ws"),
    connectionParams: async () => {
      return { token: state.token };
    },
  })
);

const httpLink = new HttpLink({
  uri: `${location.origin}/graphql-backend`,
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
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      ControlMap: {
        fields: {
          frameIds: {
            merge(existing, incoming) {
              const controlMap = toControlMap(incoming);
              setControlMap({ payload: controlMap });
              return incoming;
            },
          },
        },
      },
      PositionMap: {
        fields: {
          frameIds: {
            merge(existing, incoming) {
              const posMap = toPosMap(incoming);
              setPosMap({ payload: posMap });
              return incoming;
            },
          },
        },
      },
    },
  }),
  connectToDevTools: process.env.NODE_ENV !== "production",
});

Subscriptions(client);

export default client;
