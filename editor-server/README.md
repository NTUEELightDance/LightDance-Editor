# Editor Server

### 1. Spin up database

```sh
# Lightdance-Editor
docker compose -f dev.docker-compose.yml up -d
```

### 2. Migrate seaORM

```sh
# Lightdance-Editor/editor-server
cargo seaorm migrate
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
3. follow the steps above to initialize the database again

## How to create a new migration

1. Create a new migration file `mXXXXXXXX_XXXXX_${File Name}.rs` under `Lightdance-Editor/editor-server/seaorm/migration/src` by typing

```sh
# Lightdance-Editor/editor-server/seaorm
sea-orm-cli migrate generate ${File Name}
```

2. Manually modify the file
3. Renew the `entities` directory by typing

```sh
# Lightdance-Editor/editor-server/seaorm
sea-orm-cli generate entity -o src/entities --database-url "mysql://root:password@localhost:3306/editor"
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
**Remember to update User Metadata according to your changes in the format introduced above**
