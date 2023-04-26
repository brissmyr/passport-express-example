const path = require('path');
const Html = require('html-webpack-plugin');
const Css = require('mini-css-extract-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader', options: { presets: ['@babel/preset-env'] } },
      },
      {
        test: /\.css$/i,
        include: path.resolve(__dirname, 'src'),
        use: [ { loader: Css.loader }, 'css-loader', 'postcss-loader' ],
      },
    ],
  },
  plugins: [
    new Html({ template: './views/index.ejs', filename: './index.html' }),
    new Css({ filename: 'main.css' }),
  ],
};
