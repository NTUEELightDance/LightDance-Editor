FROM node:16-buster

# setup working directory
WORKDIR /app

RUN mkdir file-server

# install node_modules in the container
COPY ["file-server/package.json", "file-server/yarn.lock", "file-server/"]

RUN yarn install --cwd ./file-server

# copy files to /app/files
COPY ./file-server ./file-server

EXPOSE 8081

WORKDIR /app/file-server

# serve the port
CMD ["yarn", "deploy"]
