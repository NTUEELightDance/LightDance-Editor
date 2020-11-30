/* eslint-disable import/no-extraneous-dependencies */
const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  // devServer: {
  //   contentBase: path.resolve(__dirname, "../build"),
  //   hot: true,
  // },
  devtool: "eval-source-map",
  // plugins: [new webpack.HotModuleReplacementPlugin()],
};
