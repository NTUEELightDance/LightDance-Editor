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

### 1. Spin up database

```sh
# Lightdance-Editor
docker compose -f dev.docker-compose.yml up
```

### 2. Migrate prisma

```sh
# Lightdance-Editor/editor-server
pnpm migrate
```

### 3. Run editor-server

```sh
# Lightdance-Editor
pnpm dev:editor-server
```

### 4. Initialize database

```sh
# Lightdance-Editor/utils
pnpm install
node initDB.js jsons/exportDataEmpty.json
```
