/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
require("dotenv").config();
const { merge } = require("webpack-merge");

const commonConfig = require("./webpack.common.js");

const env = process.env.NODE_ENV || "dev";

const envConfig = require(`./webpack.${env}.js`);

module.exports = () => {
  return merge(commonConfig, envConfig);
};
