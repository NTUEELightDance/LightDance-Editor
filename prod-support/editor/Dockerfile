FROM node:16-buster

# setup working directory
WORKDIR /app

RUN npm install serve -g

# install node_modules in the container
COPY ["editor/package.json", "editor/yarn.lock", "./"]

RUN yarn

# copy everything to /app
COPY ./editor .

EXPOSE 8080

RUN yarn build

# serve the port
CMD ["serve", "-s", "dist", "-l", "8080"]
