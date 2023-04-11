const path = require('path');
const nextBuildId = require('next-build-id');
const CopyPlugin = require('copy-webpack-plugin');

const nextConfig = {
  reactStrictMode: false,
  generateBuildId: () => nextBuildId({ dir: __dirname }),
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules/@xxnetwork/xxdk-npm/dist'),
            to: path.join(__dirname, 'public')
          },
        ],
      }),
    );

    return config;
  }
};

module.exports = nextConfig;
