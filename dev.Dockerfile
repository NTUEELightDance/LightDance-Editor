FROM node:16-buster
WORKDIR /app
RUN mkdir editor editor-server controller-server file-server
COPY ["package.json", "yarn.lock", "./"]
COPY ["editor/package.json", "editor/yarn.lock", "editor/"]
COPY ["editor-server/package.json", "editor-server/yarn.lock","editor-server/"]
COPY ["controller-server/package.json", "controller-server/yarn.lock","controller-server/"]
COPY ["file-server/package.json", "file-server/yarn.lock","file-server/"]

RUN yarn install:all

EXPOSE 8080
EXPOSE 8081
EXPOSE 8082
EXPOSE 4000
ENV NODE_OPTIONS='--max-old-space-size=8192'

CMD ["yarn", "dev"]

