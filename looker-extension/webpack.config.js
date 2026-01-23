const path = require('path');

module.exports = {
  entry: './index.jsx',
  output: {
    filename: 'looker-ml-predictor.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
              '@babel/preset-react'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
};
