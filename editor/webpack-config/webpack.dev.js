/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  devServer: {
    contentBase: path.resolve(__dirname, "../build"),
    hot: true,
    proxy: {
      // file-server port at 8081
      "/asset": "http://localhost:8081",
      "/music": "http://localhost:8081",
      "/data": "http://localhost:8081",
    },
  },
  devtool: "eval-source-map",
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
