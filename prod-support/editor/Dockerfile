FROM node:18-buster

WORKDIR /app

RUN npm install serve -g
RUN corepack enable

COPY ["editor/package.json", "editor/pnpm-lock.yaml", "./"]

RUN pnpm install

COPY ./editor .

EXPOSE 8080

RUN pnpm build

CMD ["serve", "-s", "dist", "-l", "8080"]
