import path from "path";
import express from "express";
import "dotenv-defaults/config";
import http from "http";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import { execute, subscribe } from "graphql";
import {
  SubscriptionServer,
  ConnectionContext,
} from "subscriptions-transport-ws";
import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import fileUpload from "express-fileupload";
import prisma from "./prisma";

import { resolvers } from "./resolvers";
import db from "./models";
import mongo from "./mongo";
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";
import { ConnectionParam, TContext } from "./types/global";

const port = process.env.PORT || 4000;
const { SECRET_KEY } = process.env

;(async function () {
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
  const subscriptionBuildOptions = async (
    connectionParams: ConnectionParam,
    webSocket: any
  ) => {
    try {
      const { userID, name } = connectionParams;
      if (!userID) throw new Error("UserID and name must be filled.");
      const user = await db.User.findOne({ userID });
      if (user) {
        return { db, userID, prisma };
      } else {
        await new db.User({ name, userID }).save();
        return { db, userID, prisma };
      }
    } catch (e) {
      console.log(e);
    }
  };

  const subscriptionDestroyOptions = async (
    webSocket: any,
    context: ConnectionContext
  ) => {
    const initialContext = await context.initPromise;
    if (initialContext) {
      const { userID } = initialContext;
      await db.ControlFrame.updateMany(
        { editing: userID },
        { editing: undefined }
      );
      await db.PositionFrame.updateMany(
        { editing: userID },
        { editing: undefined }
      );
      await db.User.deleteMany({ userID });
    }
  };

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect: subscriptionBuildOptions,
      onDisconnect: subscriptionDestroyOptions,
    },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      try {
        // make sure that we know who are accessing backend
        const { name, userid } = req.headers;
        if (!userid || !name)
          throw new Error("UserID and name must be filled.");
        const userID: string = (typeof(userid) === "string") ? userid : userid[0];
        const userName: string = (typeof(name) === "string") ? name: name[0];
        const user = await db.User.findOne({ name: userName, userID: userID });
        if (!user) {
          const newUser = await new db.User({
            name: userName,
            userID: userid,
          }).save();
        }
        const result: TContext = { db, userID, prisma };
        return result;
      } catch (e) {
        console.log(e);
      }
    },
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
      ...(process.env.NODE_ENV === "production"
        ? [ApolloServerPluginLandingPageDisabled()]
        : []),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(port, () => {
    console.log(`🚀 Server Ready at ${port}! 🚀`);
    console.log(`Graphql Port at ${port}${server.graphqlPath}`);
  });
})();
