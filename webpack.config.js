const path = require("path");
const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: slsw.lib.entries,
  mode: "production",
  devtool: "source-map",
  target: "node",
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  plugins: [new CleanWebpackPlugin()],
};
