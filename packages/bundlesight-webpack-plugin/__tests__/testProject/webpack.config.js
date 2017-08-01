const path = require('path');
const BuildsightPlugin = require('../../index').BundlesightPlugin;

module.exports = {
  name: 'testProject',
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new BuildsightPlugin({
      repository: '@@test/webpack-bundlesight-plugin',
      branch: 'master',
    }),
  ],
};
