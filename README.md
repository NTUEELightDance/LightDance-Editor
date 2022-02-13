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
  An Editor for editing and simulating light dance show
</p>
<div align="center" >
    <img src="https://user-images.githubusercontent.com/17617373/126040650-b25e5a8f-5b40-4636-93b9-4a79e690e816.gif" width="100%">
</div>

## Architecture

![image](https://user-images.githubusercontent.com/17617373/151387263-944c1fe0-d6d9-44a9-9c9b-75fc9fee656d.png)

### Services

```
http://localhost:8080 - editor
http://localhost:4000 - editor-server
http://localhost:8081 - file-server
http://localhost:8082 - controller-server
```

## Development

### Docker

You can use Docker to install and start all the services. You can see the editor on `http://localhost:8080`.

```bash
docker-compose -f dev.docker-compose.yml up -d
```

### Local

#### Install the dependencies

This will install all the dependencies in the subfolders.

```bash
yarn install:all
```

#### Run the services

This will run all the services parallelly. You can see the editor on `http://localhost:8080`.

```bash
yarn dev
```

**For development for editor-server**

You need to have MongoDB running on `mongodb://localhost:27017`

```bash
docker-compose -f dev.docker-compose.yml up -d mongodb redisdb
```

### Initialize Database

After starting all services, one can add 2021's control and position data into mongoDB.

```bash
cd utils
yarn
export NODE_OPTIONS="--max-old-space-size=8192" // Incase heap out of memory
node initDB.js ${filePath}  
// node initDB.js ../others/dance_json/export.json
```
