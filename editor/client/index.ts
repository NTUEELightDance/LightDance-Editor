import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

import Subscriptions from "./subscription";
import { state } from "@/core/state";
import {
  setColorMap,
  setControlMap,
  setLEDEffectIDtable,
  setLEDMap,
} from "@/core/actions";
import {
  toControlMap,
  toLEDEffectIDTable,
  toLEDMap,
  toPosMap,
} from "@/core/utils/convert";
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
            async merge(existing, incoming) {
              if (incoming instanceof Promise) {
                incoming = await incoming;
              }

              console.log({
                existing,
                incoming,
              });

              const controlMap = toControlMap(incoming);
              await setControlMap({
                payload: controlMap,
                options: {
                  refreshThreeSimulator: false,
                  refreshWavesurfer: false,
                },
              });
              return incoming;
            },
          },
        },
      },
      PositionMap: {
        fields: {
          frameIds: {
            async merge(existing, incoming) {
              if (incoming instanceof Promise) {
                incoming = await incoming;
              }
              const posMap = toPosMap(incoming);
              await setPosMap({
                payload: posMap,
                options: {
                  refreshThreeSimulator: false,
                  refreshWavesurfer: false,
                },
              });
              return incoming;
            },
          },
        },
      },
      ColorMap: {
        fields: {
          colorMap: {
            async merge(existing, incoming) {
              if (incoming instanceof Promise) {
                incoming = await incoming;
              }
              const colorMap = incoming;
              // await setColorMap({ payload: colorMap });
              return colorMap;
            },
          },
        },
      },
      LEDMap: {
        fields: {
          LEDMap: {
            async merge(existing, incoming) {
              if (incoming instanceof Promise) {
                incoming = await incoming;
              }
              const ledMap = toLEDMap(incoming);
              await setLEDMap({
                payload: ledMap,
                options: {
                  refreshThreeSimulator: false,
                  refreshWavesurfer: false,
                },
              });
              const ledEffectIDtable = toLEDEffectIDTable(incoming);
              await setLEDEffectIDtable({
                payload: ledEffectIDtable,
                options: {
                  refreshThreeSimulator: false,
                  refreshWavesurfer: false,
                },
              });
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
