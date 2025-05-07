/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // แก้ไขปัญหา case-sensitivity
  webpack: (config, { isServer }) => {
    // ตั้งค่า case-sensitive-paths-webpack-plugin เป็น false
    config.plugins = config.plugins.filter(
      (plugin) => plugin.constructor.name !== 'CaseSensitivePathsPlugin'
    );
    
    return config;
  },
  // ปิดการใช้งาน static exports ที่มีปัญหากับ React Context
  // ใช้ standalone output แทน
  experimental: {
    // ปิดการใช้งาน app directory ถ้ามีปัญหา
    // appDir: false,
  },
};

module.exports = nextConfig;