# Editor Server

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
3. Delete the `editor-server/prisma/migrations` folder
4. follow the steps above to initialize the database again

## Tip

If you want to browse the database with a GUI

```sh
# Lightdance-Editor/editor-server
npx prisma studio
```
