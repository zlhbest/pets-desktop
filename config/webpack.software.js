const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const { DefinePlugin } = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
// 压缩js代码
const TerserWebpackPlugin = require("terser-webpack-plugin");
const path = require("path");
// 获取环境变量
const isProduction = process.env.NODE_ENV === "production";
module.exports = {
  // 入口
  entry: "./src/software/main.js",
  // 输出
  output: {
    // 文件输出路径 所有打包的文件都在这里
    // __dirname node.js的变量，代表当前文件的文件夹目录
    path: isProduction
      ? path.resolve(__dirname, "../dist/software/")
      : undefined, // 绝对路径
    // 入口文件打包的文件名
    filename: isProduction
      ? "static/js/[name].[contenthash:10].js"
      : "static/js/[name].js",
    chunkFilename: isProduction
      ? "static/js/[name].[contenthash:10].chunk.js"
      : "static/js/[name].js",
    assetModuleFilename: "static/media/[name].[hash][ext]",
    //  主动清空上一次打包结果
    clean: true,
  },
  // 加载器
  module: {
    // 这里加载loader
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024, // 小于10kb的图片会被base64处理
          },
        },
        generator: {
          // 将图片文件输出到 static/imgs 目录中
          // 将图片文件命名 [hash:8][ext][query]
          // [hash:8]: hash值取8位
          // [ext]: 使用之前的文件扩展名
          // [query]: 添加之前的query参数
          filename: "static/imgs/[hash:8][ext][query]",
        },
      },
      {
        test: /\.css$/i,
        use: [
          // 这样做主要是为了生产环境将css分离出来
          isProduction ? MiniCssExtractPlugin.loader : "vue-style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  "postcss-preset-env", // 解决大部分的css 样式兼容性问题
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/, // 排除node_modules与bower_components的文件夹，bower_components作用和npm很像
        loader: "babel-loader",
        options: {
          cacheDirectory: true, //开启babel缓存
          cacheCompression: false, //关闭缓存文件压缩
        },
      },
      // 配置vue 文件的loader
      {
        test: /\.vue$/,
        loader: "vue-loader",
        options: {
          // 开启缓存
          cacheDirectory: path.resolve(
            __dirname,
            "node_modules/.cache/vue-loader"
          ),
        },
      },
    ],
  },
  // 插件
  plugins: [
    // eslint插件
    new ESLintPlugin({
      // 检测哪些文件 只检测软件部分其余部分不关注
      context: path.resolve(__dirname, "../src/software"),
      exclude: "node_modules", // 默认值
      cache: true, // 开启缓存
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/eslintcache"
      ), // 设置缓存路径
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/software/index.html"),
    }),
    // 生产环境才会用这个  分离css
    isProduction &&
      new MiniCssExtractPlugin({
        filename: "static/css/[name].[contenthash:10].css",
        chunkFilename: "static/css/[name].[contenthash:10].chunk.css",
      }),
    // vue 加载插件
    new VueLoaderPlugin(),
    // 定义一些环境变量
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),
    //  进行复制
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "../public/software"),
          to: path.resolve(__dirname, "../dist/software"),
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
  ].filter(Boolean), // 这里要将开发环境和生产环境区分开
  //压缩相关的操作
  optimization: {
    // 是否压缩
    minimize: isProduction,
    minimizer: [
      // 压缩css文件
      new CssMinimizerPlugin(),
      // 压缩js
      new TerserWebpackPlugin(),
    ],
    //代码分割
    splitChunks: {
      chunks: "all", // 对所有模块都进行分割
      // 优化手段
      cacheGroups: {
        // 如果项目中使用element-plus，此时将所有node_modules打包在一起，那么打包输出文件会比较大。
        // 所以我们将node_modules中比较大的模块单独打包，从而并行加载速度更好
        // 如果项目中没有，请删除
        elementUI: {
          name: "chunk-elementPlus",
          test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
          priority: 30,
        },
        // 将vue相关的库单独打包，减少node_modules的chunk体积。
        vue: {
          name: "vue",
          test: /[\\/]node_modules[\\/]vue(.*)[\\/]/,
          chunks: "initial",
          priority: 20,
        },
        libs: {
          name: "chunk-libs",
          test: /[\\/]node_modules[\\/]/,
          priority: 10, // 权重最低，优先考虑前面内容
          chunks: "initial",
        },
      },
    },
  },
  // 模式
  mode: isProduction ? "production" : "development",
  resolve: {
    extensions: [".vue", ".js", ".json"],
  },
  devtool: isProduction ? "source-map" : "cheap-module-source-map",
  // 关闭性能分析提高打包速度
  performance: false,
  // 开一个服务器
  devServer: {
    open: true,
    host: "localhost",
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true, // 解决vue-router刷新404问题
  },
};
