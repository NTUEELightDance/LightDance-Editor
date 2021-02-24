FROM node:14.15.5
WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "deploy" ]