const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const pkg = require("./package.json");

module.exports = {
  mode: "production",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: pkg.name,
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: "pre",
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.build.json",
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin(), new ESLintPlugin()],
  node: { global: true },
  target: "node",
};
