FROM node:18-buster

WORKDIR /app

RUN corepack enable

COPY ["editor-server/package.json", "editor-server/pnpm-lock.yaml", "./"]

RUN pnpm install
COPY ./editor-server .
RUN npx prisma generate

EXPOSE 4000
ENV NODE_OPTIONS='--max-old-space-size=8192'

CMD ["pnpm", "migrate:prod"]
