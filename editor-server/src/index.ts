import path from "path";
import express from "express";
import "dotenv-defaults/config";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";

import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import fileUpload from "express-fileupload";

import { resolvers } from "./resolvers";
import db from "./models";
import mongo from "./mongo";
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";
import { verifyToken } from "./utility";

import { ConnectionParam } from "./types/global";

const port = process.env.PORT || 4000;
// const { SECRET_KEY } = process.env;

(async function () {
  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
  app.use(fileUpload());
  app.use(cookieParser());
  app.use("/api", apiRoute);

  mongo();

  const httpServer = http.createServer(app);

  const pubsub = new PubSub();
  const schema = await buildSchema({
    resolvers,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve("schema.gql"),
    globalMiddlewares: [AccessMiddleware],
    pubSub: pubsub,
  });

  // Creating the WebSocket subscription server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
  });

  // Passing in an instance of a GraphQLSchema and
  // telling the WebSocketServer to start listening
  const serverCleanup = useServer<ConnectionParam, { username: string }>(
    {
      schema,
      context: async (ctx) => {
        const token = ctx.connectionParams?.token;
        const { success, user } = await verifyToken(token);
        if (success) return { username: user.username, db };
      },
      onConnect: async (ctx) => {
        const token = ctx.connectionParams?.token;
        console.log("connect", token);
        const { success, user } = await verifyToken(token);
        if (success) {
          ctx.extra.username = user.username;
        }
        return success;
      },
      onDisconnect: async (ctx) => {
        const username = ctx.extra.username;
        console.log("disconnect", username);
        await db.ControlFrame.updateMany(
          { editing: username },
          { editing: undefined }
        );
        await db.PositionFrame.updateMany(
          { editing: username },
          { editing: undefined }
        );
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      console.log("context", req.cookies.token);
      const token = req.cookies.token;
      const { success, user } = await verifyToken(token);
      if (success) {
        return { username: user.username, db };
      } else {
        throw new Error("Unauthorized");
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.dispose();
            },
          };
        },
      },
      ...(process.env.NODE_ENV === "production"
        ? [ApolloServerPluginLandingPageDisabled()]
        : []),
    ],
    cache: "bounded",
  });

  await server.start();
  server.applyMiddleware({ app });

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
})();
