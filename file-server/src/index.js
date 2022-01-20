const express = require("express");
const path = require("path");

const app = express();

const assetPath = path.resolve(__dirname, "..", "..", "./asset");
app.use("/asset", express.static(assetPath));
const musicPath = path.resolve(__dirname, "..", "..", "./music");
app.use("/music", express.static(musicPath));
const dataPath = path.resolve(__dirname, "..", "..", "./data");
app.use("/data", express.static(dataPath));

const port = process.env.PORT || 8081;

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
