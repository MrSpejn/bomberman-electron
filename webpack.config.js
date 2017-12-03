const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './app/app.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts'],
  },
  devtool: 'source-map',
  target: 'electron',
  module: {
    rules: [{
      test: /\.ts?$/,
      use: 'ts-loader',
    }, {
      test: /\.(css|scss)$/,
      use: [{
        loader: 'style-loader',
      }, {
        loader: 'css-loader',
      }, {
        loader: 'sass-loader',
      }],
    }, {
      test: /\.(svg|jpg|png)$/,
      exclude: /(node_modules)/,
      use: 'file-loader',
    },
    {test: /webpack-dev-server\\client/, loader: "null-loader"},
  ],

  },
  devServer: {
    host: '0.0.0.0',
    hot: false,
    inline: false,
    historyApiFallback: true,
  },
};
