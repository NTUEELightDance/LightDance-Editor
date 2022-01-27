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
    <img src="https://user-images.githubusercontent.com/17617373/126040650-b25e5a8f-5b40-4636-93b9-4a79e690e816.gif">
</div>

## Architecture

![](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/15b33aa7-2128-4bea-af48-e9edf3506d62/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220127%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220127T071427Z&X-Amz-Expires=86400&X-Amz-Signature=32fb16b52d92e7e6f485b900cd4f203e94c28b50497bbe11d5782a02523d1732&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22Untitled.png%22&x-id=GetObject)

## Get Started

### Installation

You should install the dependencies in the subfolders.

```bash
yarn install:editor
yarn install:editor-server
yarn install:controller-server
yarn install:file-server
```

Or you can just use the below command to install all dependencies.

```bash
yarn install:all
```

### Development

#### Editor

```bash
yarn dev:editor # runs on port 8080
```

#### Editor Server

```bash
yarn dev:editor-server # runs on port 4000
```

#### Controller Server

```bash
yarn dev:controller-server # runs on port 8082
```

#### File Server

```bash
yarn dev:file-server # runs on port 8081
```
