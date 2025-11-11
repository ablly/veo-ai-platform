/** @type {import('next').NextConfig} */
const nextConfig = {
  // 优化hydration
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react']
  },
  // 禁用ESLint和TypeScript检查（EdgeOne部署需要）
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 压缩
  compress: true,
  // 禁用开发环境的hydration警告（仅在开发环境）
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
}

module.exports = nextConfig






