/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { merge } = require("webpack-merge");

const commonConfig = require("./webpack.common.js");

const env = process.env.NODE_ENV || "dev";
console.log(`config = ./webpack.${env}.js`);

const envConfig = require(`./webpack.${env}.js`);

module.exports = () => {
  return merge(commonConfig, envConfig);
};
