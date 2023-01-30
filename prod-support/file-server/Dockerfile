FROM node:18-buster

WORKDIR /app

RUN corepack enable

# LightDance-Editor/files will be mapped to /app/files
RUN mkdir file-server
COPY ["file-server/package.json", "file-server/pnpm-lock.yaml", "./file-server/"]

WORKDIR /app/file-server
RUN pnpm install

COPY ./file-server .

EXPOSE 8081

CMD ["pnpm", "prod"]
