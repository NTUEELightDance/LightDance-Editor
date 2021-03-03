FROM node:14.15.5
WORKDIR /app
ENV NODE_ENV=prod
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "deploy" ]