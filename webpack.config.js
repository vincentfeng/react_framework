var path = require('path');
var webpack = require('webpack');
var node_modules_dir = path.join(__dirname, 'node_modules');
var WebpackShellPlugin = require('webpack-shell-plugin');

// 排除编译的第三方库（为了兼容IE8，部分必须进行es3编译）
var deps = [
  'babel-polyfill/dist/polyfill.min.js',
  'echarts/dist/echarts.min.js',
  'jquery/dist/jquery.min.js',
  'jquery.scrollbar/jquery.scrollbar.min.js',
  'lodash/lodash.min.js',
  // 'react/dist/react.min.js',
  // 'react-bootstrap/dist/react-bootstrap.min.js',
  // 'react-dom/dist/react-dom.min.js',
  'react-redux/dist/react-redux.min.js',
  // 'react-router/dist/react-router.min.js',
  'react-router-redux/dist/react-router-redux.min.js',
  'redux/dist/redux.min.js',
  'redux-thunk/dist/redux-thunk.min.js'
];

// 第三方库
var vendors = [
  'babel-polyfill',
  'echarts',
  'echarts/chart/chord',
  'echarts/chart/gauge',
  'jquery',
  'jquery.scrollbar',
  'lodash',
  // 'querystring',
  // 'rc-echarts',
  'react',
  // 'react-addons-css-transition-group',
  // 'react-bootstrap',
  'react-dom',
  // 'react-loaders',
  'react-redux',
  'react-router',
  'react-router-redux',
  'redux',
  'redux-thunk'
];

var entry, publicPath, plugins;

var NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV === 'production') {
  entry = {
    bundle: './src/entry',
    vendors: vendors
  };
  publicPath = 'assets/app/';
  plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV || 'production')
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,  // remove all comments
      },
      compress: {
        warnings: false
      }
    }),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new WebpackShellPlugin({
      onBuildEnd: ['xcopy "' + __dirname + '\\dist\\*.*" "' + __dirname + '\\..\\web\\assets" /s /e /y']
    })
  ];
} else {
  entry = {
    bundle: [
      // 'webpack-hot-middleware/client?path=http://localhost:3000/__webpack_hmr', // IE8 不支持
      './src/entry'
    ],
    vendors: vendors
  };
  publicPath = 'http://192.168.2.119:3000/assets/';
  plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV || 'development')
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
  ];
}

var config = {
  // devtool: 'source-map',
  entry: entry,
  output: {
    path: path.join(__dirname, 'dist/app'),
    //path: path.join(__dirname, '../../web/assets/network-price/app'),
    //publicPath: '/assets/network-price/app/',
    publicPath: publicPath,
    filename: 'bundle.js'
  },
  plugins: plugins,
  resolve: {
    alias: {},
    extensions: ['', '.webpack.js', '.web.js', '.js', '.less', '.css'],
    root: [
      path.resolve('./src/app/utils')
    ]
  },
  module: {
    noParse: [],
    preLoaders: [
      {
        test: /\.js$/,
        loader: 'eslint',
        exclude: [/node_modules/, /loading/],
      }
    ],
    loaders: [
      {
        test: /\.js$/,
        include: [
          path.join(__dirname, 'src'),
          /react/
        ],
        loaders: ['es3ify', 'babel']
      },
      {
        test: /\.css$/,
        // loader: ExtractLCss.extract(['css-loader']),
        include: path.join(__dirname, 'src'),
        loaders: [ 'style', 'css' ]
      },
      {
        test: /\.less$/,
        include: path.join(__dirname, 'src'),
        loaders: [ 'style', 'css', 'less' ]
      },
      {
        test: /\.(jpe?g|png|gif|eot|woff2|woff|ttf|svg)$/,
        include: path.join(__dirname, 'src'),
        loader: 'url-loader?limit=8192',
      }
    ]
  }
}

deps.forEach(function (dep) {
  var depPath = path.resolve(node_modules_dir, dep)
  config.resolve.alias[dep.split(path.sep)[0]] = depPath
  config.module.noParse.push(depPath)
});

module.exports = config;
