/**
 * @author tangsj
 * @type {[type]}
 */
const path                = require('path');
const webpack             = require('webpack');
const HtmlWebpackPlugin   = require('html-webpack-plugin');
const ExtractTextPlugin   = require('extract-text-webpack-plugin');
const CleanWebpackPlugin  = require('clean-webpack-plugin');
const autoprefixer        = require('autoprefixer');
const mqpacker            = require('css-mqpacker');
const cssimport           = require('postcss-import');
const nested              = require('postcss-nested');
const csswring            = require('csswring');
const px2rem              = require('postcss-px2rem');
const uglifyJsPlugin      = webpack.optimize.UglifyJsPlugin;

const env = process.env.NODE_ENV || 'development';

var isDev = (env == 'development');

var config =  {
  entry: {
    app: [
      "./js/app.js"
    ]
  },
  devServer: {
    host: '0.0.0.0'
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: `${process.env.MODE}/`,
    filename: 'js/[hash:8].[name].js',
    sourceMapFilename: '[file].map'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.join(process.cwd(), './js') // 只去解析运行目录下的 js

        ],
        exclude: function(path) {
          return !!path.match(/node_modules/); // 路径中含有 node_modules 的就不去解析。
        },
        loader: 'babel-loader'
      },
      {
        test: /\.(jpg|png|gif)$/i,
        loader: 'url?limit=4096&name=images/[hash:8].[name].[ext]'
      }
    ]
  },
  resolve: {
    root: [
      path.join(__dirname, 'js'),
      path.join(__dirname, 'node_modules')
    ],
    extensions: ['', '.js', '.json'],
    alias: {
    }
  },
  postcss: function (webpack) {
    return [
      cssimport({
        addDependencyTo: webpack
      }),
      nested,
      autoprefixer,
      px2rem({remUnit: 75}), // 手机开发时 加上 rem 转换
      mqpacker,
      csswring({
        removeAllComments: true
      })
    ];
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery'
    }),
    new HtmlWebpackPlugin({
      title: '万达问卷调查',
      inject: 'body',
      template: 'index.html',
      minify: {
        removeComments: isDev ? false : true,
        collapseWhitespace: true,
        minifyJS: true
      }
    })
  ]
}

if(isDev){ // 开发环境定义
  config.devtool = 'source-map';
  config.module.loaders.push({
    test: /\.css$/,
    // 在开发模式下使用 sytle 标签引用样式可以实现样式的热更新
    loaders: [ 'style-loader', 'css-loader', 'postcss-loader' ]
  });
}else{
  config.module.loaders.push({
    test: /\.css$/,
    // 在生产环境中，css提取为独立的文件 利用浏览器并发
    loader: ExtractTextPlugin.extract('css-loader!postcss-loader') // style-loader
  });
  const productPlugins = [
    new ExtractTextPlugin('css/[contenthash:8].[name].css'),
    new webpack.NoErrorsPlugin(),
    new CleanWebpackPlugin(['build']),
    new uglifyJsPlugin({
      compress: {
        warnings: false,
      },
      comments: false
    }),
    new webpack.BannerPlugin('author : codecook; mail: t_fate@163.com')
  ];
  config.plugins = config.plugins.concat(productPlugins);
}

module.exports = config;
