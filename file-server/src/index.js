const path = require("path");
const compression = require("compression");
const express = require("express");

const app = express();
app.use(compression());

const assetPath = path.resolve(__dirname, "..", "..", "files", "asset");
app.use("/asset", express.static(assetPath));
const musicPath = path.resolve(__dirname, "..", "..", "files", "music");
app.use("/music", express.static(musicPath));
const dataPath = path.resolve(__dirname, "..", "..", "files", "data");
app.use("/data", express.static(dataPath));

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
