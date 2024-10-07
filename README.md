<!-- markdownlint-disable MD041 -->
<!-- markdownlint-disable MD033 -->
<p align="center">
  <img src="https://avatars.githubusercontent.com/u/74459161?s=400&u=8e4ea6d7a17fad2a655fe5308e3f30a63779085d&v=4" alt="Logo" width="80" height="80">
</p>
<h1 align="center">NTUEE LightDance Editor</h1>

<p align="center">
  <img src="https://img.shields.io/github/v/release/NTUEELightDance/LightDance-Editor?style=flat-square" alt="Release" />
  <img src="https://img.shields.io/github/contributors/NTUEELightDance/LightDance-Editor?style=flat-square" alt="Contributors" />
  <img src="https://img.shields.io/github/license/NTUEELightDance/LightDance-Editor?style=flat-square" alt="License" />
</p>

<p align="center">
  An online editor to design, simulate and control the lights
</p>
<div align="center" >
    <img src="https://github.com/user-attachments/assets/31783e15-0606-47ef-8204-50068e81d938" width="100%">
</div>


## Architecture

![image](https://user-images.githubusercontent.com/17617373/151387263-944c1fe0-d6d9-44a9-9c9b-75fc9fee656d.png)

### Services

```text
http://localhost:8080 - editor
http://localhost:4000 - editor-server
http://localhost:8081 - file-server
http://localhost:8082 - controller-server
```

## Development

### Local
#### Install Pre-Commit
```sh
# in Lightdance-Editor
pre-commit install
```

#### Start database
copy the environment variables for development
```sh
# in Lightdance-Editor/editor-server
cp .env.development .env
```
start mySQL and redisDB
```sh
# in Lightdance-Editor
docker compose -f dev.docker-compose.yml up -d
```
migrate the database
```sh
# in Lightdance-Editor/editor-server
cargo prisma migrate dev --skip-generate --name init
```

#### Install the dependencies

This will install all dependencies for the app.
```sh
# in Lightdance-Editor
pnpm install:all
```

#### Run all services

There are the services you'll need to run if you are developing editor-server. You need to start all of them manually. Run these commands in different terminals respectively, in the order shown below:

```sh
pnpm dev:file-server
pnpm dev:editor-server
pnpm dev:editor
```

If you are developing the command center, you may also need to run:

```sh
pnpm dev:controller-server
```

#### Run all services in parallel

This command runs all services in parallel. You can see the editor on `http://localhost:8080`. This is useful for demo, yet not recommended in development.

```sh
pnpm dev
```

#### Initialize Database: Development

If you are running this for the first time, you need to initialize the database for things to work.

```sh
# Lightdance-Editor/utils
pnpm install
node initDB.js jsons/exportDataEmpty.json
```

## Production

Start all services

```sh
docker compose -f prod-support/prod.docker-compose.yml up -d
```

Editor will run on `http://localhost:8080`.

Editor-server will run on `http://localhost:4000`.

### Initialize Database: Production

After starting all services, one must initialize the database.

```sh
# Lightdance-Editor/utils
export NODE_OPTIONS="--max-old-space-size=8192"
pnpm install
node initDB.js jsons/exportDataEmpty.json
```

## Configurations and Utilities

Refer to [utils/README.md](utils/README.md) for editor configurations and utility usage.
