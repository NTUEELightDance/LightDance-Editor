# Editor Server

## When schema changes

When you change the SeaORM migration, you need to re-run the migration and regenerate entities.

### 1. Spin up database

```sh
# Lightdance-Editor
docker compose -f dev.docker-compose.yml up -d
```

### 2. Migrate SeaORM

```sh
# Lightdance-Editor/editor-server/sea-orm
sea-orm-cli migrate up
sea-orm-cli generate entity -o src/entity
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
3. Delete the `editor-server/sea-orm/migration/src` generated tables if you want a clean re-run (or drop and recreate the DB)
4. follow the steps above to initialize the database again

## Tip

If you want to browse the database with a GUI, use your preferred MySQL client (e.g. DBeaver/MySQL Workbench).

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
**Remember to update User Metadata according to your changes in the format introduced above**
