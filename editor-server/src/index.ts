import path from "path";
import express from "express";
import "dotenv-defaults/config";
import http from "http";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { PubSub } from "graphql-subscriptions";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import fileUpload from "express-fileupload";
import jwt from "jsonwebtoken"

import { resolvers } from "./resolvers";
import db from "./models";
import mongo from "./mongo";
import apiRoute from "./routes";
import { AccessMiddleware } from "./middlewares/accessLogger";

interface JwtPayload{
  userID: string
}

const port = process.env.PORT || 4000;
const { SECRET_KEY } = process.env;
let secretKey: string
if (SECRET_KEY){
  secretKey = SECRET_KEY
}

(async function () {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(fileUpload());
  app.use("/api", apiRoute);

  mongo();

  const httpServer = http.createServer(app);
  // const schema = makeExecutableSchema({ typeDefs, resolvers })
  var pubsub = new PubSub();
  const schema = await buildSchema({
    resolvers,
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, "schema.gql"),
    globalMiddlewares: [AccessMiddleware],
    pubSub: pubsub,
  });

  const subscriptionBuildOptions = async (
    connectionParams: any,
    webSocket: any
  ) => {
    try {
      const token = connectionParams.Authorization || '';
      const splitToken = token.split(' ')[1]
      if (!splitToken) throw new Error("Token not found")
      const result = jwt.verify(splitToken, secretKey) as JwtPayload
      const {userID} = result
      const user = await db.User.findOne({ userID });
      if (user) {
        return { db, userID };
      } else {
        throw new Error("User not found")
      }
    } catch (e) {}
  };

  const subscriptionDestroyOptions = async (webSocket: any, context: any) => {
    const initialContext = await context.initPromise;
    if (initialContext) {
      const { userID } = initialContext;
      await db.ControlFrame.updateMany({ editing: userID }, { editing: null });
      await db.PositionFrame.updateMany({ editing: userID }, { editing: null });
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
        const token = req.headers.authorization || '';
        const splitToken = token.split(' ')[1]
        if (!splitToken) throw new Error("Token not found")
        const result = jwt.verify(splitToken, secretKey) as JwtPayload
        const {userID} = result

        const user = await db.User.findOne({ userID });
        if (user) {
          return { db, userID };
        } else {
          throw new Error("User not found")
        }
      } catch (e) {}
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
