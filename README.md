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
    <img src="https://user-images.githubusercontent.com/17617373/199907047-a87e1cea-4ff4-45c9-9f41-e05d28a47473.gif" width="100%">
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

#### Install the dependencies

This will install all dependencies for the app.

```bash
pnpm install-pnpm:all
```

#### Start database

You need to have mongodb and redis running for the backend to work.

```bash
docker compose -f dev.docker-compose.yml up -d mongodb redisdb
```

#### Run all services

There are several services in this app. You need to start all of them manually. Run these commands in different terminals, in that order:

```bash
pnpm dev:file-server
pnpm dev:editor-server
pnpm dev:editor
```

#### Run all services in parallel

This command runs all services in parallel. You can see the editor on `http://localhost:8080`. This is useful for demo, yet not recommended in development.

```bash
pnpm dev
```

#### Initialize Database: Development

If you are running this for the first time, you need to initialize the database for things to work.

```bash
cd utils
pnpm install
node initDB.js out/exportData.json
node initLED.js out/exportLED.json
```

## Production

Start all services

```bash
docker compose -f prod-support/prod.docker-compose.yml up -d
```

Editor will run on `http://localhost:8080`.

Editor-server will run on `http://localhost:4000`.

### Initialize Database: Production

After starting all services, one must initialize the database.

```bash
export NODE_OPTIONS="--max-old-space-size=8192"
cd utils
pnpm install
node initDB.js out/exportData.json
node initLED.js out/exportLED.json
```
