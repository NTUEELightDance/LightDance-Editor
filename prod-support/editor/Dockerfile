FROM node:16-buster

# setup working directory
WORKDIR /app

RUN npm install serve -g

COPY ["editor/package.json", "editor/yarn.lock", "./"]

# install node_modules in the container
RUN yarn

# copy things in editor to /app
COPY ./editor .

EXPOSE 8080

RUN yarn build

# serve the port
CMD ["serve", "-s", "dist", "-l", "8080"]
