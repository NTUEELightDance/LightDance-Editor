import path from "path";
import express from "express";
import "dotenv-defaults/config";
import http from "http";
import bodyParser from "body-parser";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";

import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import fileUpload from "express-fileupload";

import { resolvers } from "./resolvers";
import db from "./models";
import mongo from "./mongo";
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";
import { TContext, ConnectionParam } from "./types/global";

const port = process.env.PORT || 4000;
// const { SECRET_KEY } = process.env;

(async function () {
  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
  app.use(fileUpload());
  app.use("/api", apiRoute);

  mongo();

  const httpServer = http.createServer(app);
  // const schema = makeExecutableSchema({ typeDefs, resolvers })
  const pubsub = new PubSub();
  const schema = await buildSchema({
    resolvers,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    globalMiddlewares: [AccessMiddleware],
    pubSub: pubsub,
  });

  // const subscriptionBuildOptions = async (
  //   connectionParams: ConnectionParam,
  // ) => {
  //   try {
  //     const { userID, name } = connectionParams;
  //     if (!userID) throw new Error("UserID and name must be filled.");
  //     const user = await db.User.findOne({ userID });
  //     if (user) {
  //       return { db, userID };
  //     } else {
  //       await new db.User({ name, userID }).save();
  //       return { db, userID };
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  // const subscriptionDestroyOptions = async (webSocket: WebSocket, context: ConnectionContext) => {
  //   const initialContext = await context.initPromise;
  //   if (initialContext) {
  //     const { userID } = initialContext;
  //     await db.ControlFrame.updateMany({ editing: userID }, { editing: undefined });
  //     await db.PositionFrame.updateMany({ editing: userID }, { editing: undefined });
  //     await db.User.deleteMany({ userID });
  //   }
  // };

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
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        console.log({ ctx });
        return ctx.connectionParams;
      },
      onConnect: async (ctx) => {
        console.log({ ctx });
      },
      onDisconnect: async (ctx) => {
        console.log({ ctx });
      },
    },
    wsServer
  );

  // const subscriptionServer = SubscriptionServer.create(
  //   {
  //     schema,
  //     execute,
  //     subscribe,
  //     onConnect: subscriptionBuildOptions,
  //     onDisconnect: subscriptionDestroyOptions,
  //   },
  //   { server: httpServer, path: "/graphql" }
  // );

  const server = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        // make sure that we know who are accessing backend
        const { name, userid } = req.headers;
        if (!userid || !name)
          throw new Error("UserID and name must be filled.");
        const userID: string = typeof userid === "string" ? userid : userid[0];
        const userName: string = typeof name === "string" ? name : name[0];
        const user = await db.User.findOne({ name: userName, userID: userID });
        if (!user) {
          await new db.User({ name: userName, userID: userid }).save();
        }
        return { db, userID };
      },
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
})();
