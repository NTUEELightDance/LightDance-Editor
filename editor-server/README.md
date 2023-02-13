# Editor Server

## First install

You need to first generate prisma client code from you schema.prisma file after you install the package:

```sh
npx prisma generate
```

or

```sh
pnpm generate
```

If you are running this for the first time, you will need to follow the steps below to initialize the database.

## When `prisma.schema` changes

When you change the prisma schema, you need to regenerate the prisma client code and migrate the database.

```sh
pnpm migrate
```

### 1. Spin up database

```sh
# Lightdance-Editor
docker compose -f dev.docker-compose.yml up -d postgresql redisdb
```

### 2. Update prisma schema

Modify `editor-server/prisma/schema.prisma`

### 3. Migrate prisma

```sh
# Lightdance-Editor/editor-server
npx prisma migrate dev --name init
```

or

```sh
# Lightdance-Editor/editor-server
pnpm migrate
```

### 4. Run editor-server

```sh
pnpm dev-pnpm:editor-server
```

### 5. Initialize database

```sh
# Lightdance-Editor/utils
pnpm install
node initDB.js jsons/exportDataEmpty.json
```
