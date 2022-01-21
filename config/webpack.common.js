/* eslint-disable import/no-extraneous-dependencies */
require("dotenv").config();
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: [
    "react-hot-loader/patch",
    path.resolve(__dirname, "..", "./src/client/index.tsx"),
  ],
  output: {
    path: path.resolve(__dirname, "..", "./build"),
    filename: "bundle.js",
    publicPath: "/",
  },
  resolve: {
    extensions: ["*", ".js", ".jsx", ".ts", ".tsx"],
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "..", "./src/client/index.html"),
    }),
  ],
  module: {
    rules: [ 
      {
        test: /\.(ts|tsx|js|jsx)$/,                        
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              '@babel/typescript',                  
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: { version: "3.9", proposals: true },
                },
              ],
              "@babel/preset-react",
            ],
            plugins: ["react-hot-loader/babel", "@babel/proposal-class-properties"],
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          },
        },
      },
      {
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        use: {
          loader: "file-loader",
          options: {
            name: "[path][name].[ext]",
          },
        },
      },
    ],
  },
};
