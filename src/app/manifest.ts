import { MetadataRoute } from 'next'

/**
 * PWA Manifest配置
 * 让网站可以像APP一样安装到手机桌面
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VEO AI - 双引擎AI视频生成平台',
    short_name: 'VEO AI',
    description: '全球首家集成SORA 2.0与VEO 3.1双AI引擎的视频生成平台，支持支付宝和Stripe双支付',
    start_url: '/',
    display: 'standalone',
    background_color: '#6366f1',
    theme_color: '#6366f1',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    categories: ['productivity', 'multimedia', 'utilities'],
    lang: 'zh-CN',
    dir: 'ltr',
  }
}
