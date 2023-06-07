const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
  entry: "./src/live2d/main.ts",
  output: {
    path: path.resolve(__dirname, "../dist/live2d/"),
    filename: "static/js/[name].[contenthash:10].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/live2d/index.html"),
    }),
    //  进行复制
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public/live2d"),
          to: path.resolve(__dirname, "../dist/live2d"),
          toType: "dir",
          noErrorOnMissing: true,
          globOptions: {
            ignore: ["**/index.html"],
          },
          info: {
            minimized: true,
          },
        },
      ],
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@framework": path.resolve(
        __dirname,
        "../public/live2d/live2dSDK/Framework"
      ),
    },
  },
  mode: "development",
   // 开一个服务器
   devServer: {
    open: true,
    host: "localhost",
    port: 4000,
    hot: true,
    compress: true,
  },
  devtool: 'inline-source-map'
};
