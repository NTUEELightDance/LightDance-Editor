import path from "path";
import express from "express";

import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginDrainHttpServer,
} from "apollo-server-core";

import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import fileUpload from "express-fileupload";

import prisma from "./prisma";
import { resolvers } from "./resolvers";
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";
import { ConnectionParam, TContext } from "./types/global";
import { verifyToken } from "./authentication";
import test from "node:test";

const port = process.env.PORT || 4000;

(async function () {
  const app = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
  app.use(fileUpload());
  app.use(cookieParser());
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

  // Creating the WebSocket subscription server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: "/graphql",
  });

  const serverCleanup = useServer<
    ConnectionParam,
    { username: string; userId: number }
  >(
    {
      schema,
      context: async (ctx): Promise<TContext> => {
        if (process.env.NODE_ENV === "development") {
          const testUser = await prisma.user.findFirst();
          if (testUser === null) throw new Error("No test user found");
          return {
            userId: testUser.id,
            username: testUser.name,
            prisma,
          };
        }
        const token = ctx.connectionParams?.token;
        const { success, user } = await verifyToken(token);
        if (success) {
          return { userId: user.id, username: user.name, prisma };
        } else {
          throw new Error("Invalid token");
        }
      },
      onConnect: async (ctx) => {
        if (process.env.NODE_ENV === "development") {
          const testUser = await prisma.user.findFirst();
          if (testUser === null) throw new Error("No test user found");
          ctx.extra.username = testUser.name;
          ctx.extra.userId = testUser.id;
          return true;
        }
        const token = ctx.connectionParams?.token;
        console.log("connect", token);
        const { success, user } = await verifyToken(token);
        if (success) {
          ctx.extra.username = user.name;
          ctx.extra.userId = user.id;
        }
        return success;
      },
      onDisconnect: async (ctx) => {
        const { username, userId } = ctx.extra;
        console.log("disconnect", username);
        await prisma.editingControlFrame.update({
          where: {
            userId,
          },
          data: {
            frameId: null,
          },
        });
        await prisma.editingPositionFrame.update({
          where: {
            userId,
          },
          data: {
            frameId: null,
          },
        });
        await prisma.editingLEDEffect.update({
          where: {
            userId,
          },
          data: {
            LEDEffectId: null,
          },
        });
      },
    },
    wsServer
  );

  const server = new ApolloServer({
    schema,
    context: async ({ req }): Promise<TContext> => {
      if (process.env.NODE_ENV === "development") {
        const testUser = await prisma.user.findFirst();
        if (testUser === null) throw new Error("No test user found");
        // initialize editing
        const checkEditingControlExist = await prisma.editingControlFrame.findFirst({
          where: { userId: testUser.id },
        });
        if (!checkEditingControlExist) {
          await prisma.editingControlFrame.create({
            data: { userId: testUser.id, frameId: null },
          });
        };
        const checkEditingPositionExist = await prisma.editingPositionFrame.findFirst({
          where: { userId: testUser.id },
        });
        if (!checkEditingPositionExist) {
          await prisma.editingPositionFrame.create({
            data: { userId: testUser.id, frameId: null },
          });
        };
        const checkEditingLEDExist = await prisma.editingLEDEffect.findFirst({
          where: { userId: testUser.id },
        });
        if (!checkEditingLEDExist) {
          await prisma.editingLEDEffect.create({
            data: { userId: testUser.id, LEDEffectId: null },
          });
        };
        return {
          prisma,
          userId: testUser.id,
          username: testUser.name,
        };
      }
      console.log("context", req.cookies.token);
      const token = req.cookies.token;
      const { success, user } = await verifyToken(token);
      if (success) {
        // initialize editing
        const checkEditingControlExist = await prisma.editingControlFrame.findFirst({
          where: { userId: user.id },
        });
        if (!checkEditingControlExist) {
          await prisma.editingControlFrame.create({
            data: { userId: user.id, frameId: null },
          });
        };
        const checkEditingPositionExist = await prisma.editingPositionFrame.findFirst({
          where: { userId: user.id },
        });
        if (!checkEditingPositionExist) {
          await prisma.editingPositionFrame.create({
            data: { userId: user.id, frameId: null },
          });
        };
        const checkEditingLEDExist = await prisma.editingLEDEffect.findFirst({
          where: { userId: user.id },
        });
        if (!checkEditingLEDExist) {
          await prisma.editingLEDEffect.create({
            data: { userId: user.id, LEDEffectId: null },
          });
        };
        return { prisma, userId: user.id, username: user.name };
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
  await new Promise<void>((resolve) => {
    httpServer.listen({ port }, resolve);
    console.log(`🚀 Server Ready at ${port}! 🚀`);
    console.log(`Graphql Port at ${port}${server.graphqlPath}`);
  });
})();
