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

## User Management with Auth0

Follow the steps below if you hope to create, delete or modify users.

### Login to Auth0
1. Sign in with GitHub account. (now under my personal account, should be migrated to LightDance account soon)
2. Go to `Dashboard > User Management > Users`

### Create User
1. click on the `Create User` button
2. set username and password, and create
3. **Important!** \
click on the new user, scroll down until you see `User Metadata`
4. set three fields (JSON syntax): `id`, `name`, see the following example\
**`name` must be a string, while `id` must not**
```json
{
  "id": 2,
  "name": "the_username_for_your_user",
}
```
5. click the `save` button

### Delete User
should be trivial

### Modify User
should be trivial\
**Remember to update User Metadata accordingly to your changes in the format introduced above**
