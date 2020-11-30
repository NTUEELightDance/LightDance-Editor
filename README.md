# 2021LightDanceEditor

## Development

set `NODE_ENV=dev` in `.env`

```bash
$ npm start # will run server on localhost:8080
```

## Production

set `NODE_ENV=prod` in `.env`

```bash
$ npm run build
$ npm start # will run server on localhost:8080
```

## Folder Structure

```
.
├── assets
│   ├── LED_CHEST
│   ├── LED_SHOES
│   ├── BLACK_PARTS
│   ├── ...
├── src
│   ├── client
│   │   ├── features
│   │   │   ├── pixi
│   │   │   │   ├── index.js
│   │   │   ├── wavesurfer
│   │   │   │   ├── index.js
│   │   │   ├── ...
│   │   ├── reducers
│   │   ├── store
│   │   ├── index.html
│   │   ├── app.js
│   │   └── index.js
│   ├── constant
│   │   └── index.js
│   ├── server
│   │   ├── router
|   │   └── app.js
├── config
│   ├── webpack.common.js
│   ├── webpack.config.js
|   ├── webpack.dev.js
|   └── webpack.prod.js
├── .env
├── .eslintrc.js
├── .gitignore
├── .prettierignore
├── .prettierc.json
├── LICENSE
├── package-lock.json
├── package.json
└── README.md
```

## Code Format

Prettier + Eslint
Please turn on VSCode setting `FormatOnSave`, and set the formatter to `revest.vs-code-prettier-eslint`
