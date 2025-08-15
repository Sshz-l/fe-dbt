import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 启用静态导出
  output: 'export',
  
  // 禁用图片优化（静态导出需要）
  images: {
    unoptimized: true,
  },
  
  // 设置基础路径（如果需要部署到子目录）
  // basePath: '/fe-dbt',
  
  // 设置资源前缀（如果需要CDN）
  // assetPrefix: 'https://your-cdn.com',
  
  // 启用压缩
  compress: true,
  
  // 构建配置
  distDir: 'dist',
};

export default nextConfig;
