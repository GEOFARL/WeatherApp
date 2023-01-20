const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const CssExtractPlugin = require('mini-css-extract-plugin');

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: '[name][contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.scss/,
        use: [
          CssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: 'defaults' }],
            ],
          },
        },
      },
    ],
  },

  plugins: [
    new CssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
});
