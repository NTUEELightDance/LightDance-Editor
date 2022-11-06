FROM node:16-buster

# setup working directory
WORKDIR /app

RUN yarn add ts-node -g

COPY ["editor-server/package.json", "editor-server/yarn.lock", "./"]

# install node_modules in the container
RUN yarn

# copy things in editor-server to /app
COPY ./editor-server .

EXPOSE 4000

# Set the environment variables
ENV MONGO_HOST=mongodb
ENV REDIS_HOST=redisdb
ENV NODE_OPTIONS='--max-old-space-size=8192'

# serve the port
CMD ["yarn", "deploy"]
