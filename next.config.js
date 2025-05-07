/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // ตั้งค่า case-sensitive-paths-webpack-plugin เป็น false
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'CaseSensitivePathsPlugin'
    );
    
    // เพิ่มการกำหนดค่า resolve.alias ถ้าจำเป็น
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './')
    };
    
    return config;
  },
};

module.exports = nextConfig;
