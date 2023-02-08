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
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";
import { ConnectionParam, TContext } from "./types/global";

const port = process.env.PORT || 4000;

(async function () {
  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
  app.use(fileUpload());
  app.use("/api", apiRoute);

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

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    { server: httpServer, path: "/graphql" }
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      // make sure that we know who are accessing backend
      const { name, password } = req.headers;
      if (!name || !password)
        throw new Error("password and name must be filled.");
      let userID;
      const userName: string = (typeof(name) === "string") ? name: name[0];
      const userPassword: string = (typeof(password) === "string") ? password : password[0];
      const user = await prisma.user.findFirst({where: {name: userName}});
      if (!user) {
        const newUser = await prisma.user.create({data: {name: userName, password: userPassword}});
        await prisma.editingControlFrame.create({data: {userId: newUser.id, frameId: null}});
        await prisma.editingPositionFrame.create({data: {userId: newUser.id, frameId: null}});
        userID = newUser.id;
      }
      else{
        userID = user.id;
      }
      return {userID: userID, prisma, userPassword: "admin"} as TContext;
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
