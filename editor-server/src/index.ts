import path from "path";
import fs from "fs";
import express from "express";
import "dotenv-defaults/config";
import http from "http";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { resolvers } from "./resolvers";

// import resolvers from "./resolvers"
import db from "./models";
import mongo from "./mongo";

const port = process.env.PORT || 4000;
const { SECRET_KEY } = process.env;

(async function () {
  const app = express();
  app.use(bodyParser.json());

  mongo();

  const httpServer = http.createServer(app);
  // const schema = makeExecutableSchema({ typeDefs, resolvers })
  var pubsub = new PubSub();
  const schema = await buildSchema({
    resolvers,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    pubSub: pubsub,
  });

  const subscriptionBuildOptions = async (
    connectionParams: any,
    webSocket: any
  ) => {
    try {
      const { name, userID } = connectionParams;
      if (!userID || !name) throw new Error("UserID and name must be filled.");
      const user = await db.User.findOne({ name, userID });
      if (user) {
        return { db, userID };
      } else {
        throw new Error("User not found.");
      }
    } catch (e) {}
  };

  const subscriptionDestroyOptions = async (webSocket: any, context: any) => {
    const initialContext = await context.initPromise;
    if (initialContext) {
      const { userID } = initialContext;
      console.log(userID);
      await db.ControlFrame.updateMany({ editing: userID }, { editing: null });
      await db.PositionFrame.updateMany({ editing: userID }, { editing: null });
      await db.User.deleteOne({ userID });
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
        const { name, userid } = req.headers;
        if (!userid || !name)
          throw new Error("UserID and name must be filled.");
        const user = await db.User.findOne({ name, userID: userid });
        if (!user) {
          const newUser = await new db.User({ name, userID: userid }).save();
        }

        return { db, userID: userid };
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
    ],
  });

  await server.start();
  server.applyMiddleware({ app });

  httpServer.listen(port, () => {
    console.log(`🚀 Server Ready at ${port}! 🚀`);
    console.log(`Graphql Port at ${port}${server.graphqlPath}`);
  });
})();
