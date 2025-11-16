import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Docker 部署必需
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
};

export default nextConfig;
