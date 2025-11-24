import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // 注意：Vercel 部署不需要 standalone 模式
  // output: 'standalone', // 仅用于 Docker 部署
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  // 优化图片处理
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.aliyuncs.com',
      },
    ],
  },
  // 生成唯一的构建ID，强制Vercel重新构建
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
};

export default nextConfig;
