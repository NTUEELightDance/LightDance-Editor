## Prisma Usage

1. Make sure postgresql is running

```sh
cd ./Lightdance-Editor
docker-compose -f dev.docker-compose.yml up -d postgresqldb mongodb redisdb
```

2. Update prisma schema

- Modify `./Lightdance-Editor/editor-server/prisma/schema.prisma`

3. Migrate prisma

```sh
cd ./Lightdance-Editor/editor-server
cp .env.defaults .env
npx prisma migrate dev --name init
```

4. Run editor-server

```
yarn dev:editor-server
```

or

```
pnpm dev-pnpm:editor-server
```
