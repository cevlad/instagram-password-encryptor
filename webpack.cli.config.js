const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  mode: "production",
  entry: "./src/cli.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "cli.js",
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
          configFile: "tsconfig.cli.json",
        },
      },
    ],
  },
  plugins: [new ESLintPlugin()],
  node: { global: true },
  target: "node",
};
