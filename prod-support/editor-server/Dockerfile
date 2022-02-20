FROM node:16-buster

# setup working directory
WORKDIR /app

RUN yarn add ts-node -g

# install node_modules in the container
COPY ["editor-server/package.json", "editor-server/yarn.lock", "./"]

RUN yarn

# copy everything to /app
COPY ./editor-server .

EXPOSE 4000

ENV MONGO_HOST=mongodb
ENV REDIS_HOST=redisdb

# serve the port
CMD ["yarn", "deploy"]
