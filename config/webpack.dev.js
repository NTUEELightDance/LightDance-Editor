/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: [
    "webpack-hot-middleware/client?path=/__hmr&timeout=2000&overlay=false",
  ],
  mode: "development",
  devServer: {
    contentBase: path.resolve(__dirname, "../build"),
    hot: true,
  },
  devtool: "eval-source-map",
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
