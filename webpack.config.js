const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './app/app.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  devtool: 'source-map',
  target: 'electron',
  module: {
    rules: [{
      test: /\.(ts|tsx)?$/,
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
      use: 'file-loader',
    }, {
      test: /\.(woff|woff2|ttf|eot)$/,
      use: 'file-loader',
    },
    {test: /webpack-dev-server\\client/, loader: "null-loader"},
  ],

  },
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    hot: false,
    inline: false,
    historyApiFallback: true,
  },
};
