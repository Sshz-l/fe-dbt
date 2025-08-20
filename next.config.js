/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 改为 export 用于静态部署
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 如果你使用了环境变量，确保它们在 Cloudflare 中也配置好
  env: {
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || 'production',
  },
}

module.exports = nextConfig 