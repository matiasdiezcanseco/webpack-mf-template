const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const deps = require('./package.json').dependencies
module.exports = {
  entry: path.join(__dirname, 'src', 'index.tsx'),
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: 'http://localhost:3000/',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html'),
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        diagnosticOptions: {
          semantic: true,
          syntactic: true,
        },
        mode: 'write-references',
      },
    }),
    new ModuleFederationPlugin({
      name: 'name',
      filename: 'remoteEntry.js',
      remotes: {
        name: 'list@http://localhost:3000/remoteEntry.js',
      },
      exposes: {
        './Component': './src/components/Component.tsx',
      },
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: deps['react-dom'],
        },
      },
    }),
  ],
  mode,
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  devtool: mode !== 'production' && 'source-map',
  devServer: {
    static: './dist',
    port: 3000,
    historyApiFallback: true,
  },
}
