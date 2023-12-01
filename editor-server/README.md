# Editor Server

## First install

You need to create `.env` before all operations. You can change the settings as you want, their used in development mode.

```sh
# Lightdance-Editor/editor-server
cp .env.development .env
```

If you are running this for the first time, you will need to follow the steps below to initialize the database.

## When `prisma.schema` changes

When you change the prisma schema, you need to regenerate the prisma client code and migrate the database.

### 1. Spin up database

```sh
# Lightdance-Editor
docker compose -f dev.docker-compose.yml up -d
```

### 2. Migrate prisma

```sh
# Lightdance-Editor/editor-server
cargo prisma migrate dev --skip-generate
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

## For a fresh start

If you have initialized the database before, and you want to get a clean database, you should follow the steps below:

1. shutdown the database with `docker compose -f dev.docker-compose.yml down`
2. Delete the `data` folder
4. Delete the `editor-server/prisma/migrations` folder
5. follow the steps above to initialize the database again
