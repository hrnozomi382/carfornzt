/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: 'standalone',
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'CaseSensitivePathsPlugin'
    );
    
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './')
    };
    
    return config;
  },
};

module.exports = nextConfig;
