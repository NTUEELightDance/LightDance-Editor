FROM node:16-buster

# setup working directory
WORKDIR /app

RUN mkdir file-server

COPY ["file-server/package.json", "file-server/yarn.lock", "file-server/"]

# install node_modules in the container
RUN yarn install --cwd ./file-server

# copy file-server to /app/file-server
COPY ./file-server ./file-server

EXPOSE 8081

# change the workdir
WORKDIR /app/file-server

# serve the port
CMD ["yarn", "deploy"]
