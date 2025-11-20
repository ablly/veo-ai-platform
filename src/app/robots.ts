import { MetadataRoute } from 'next'

/**
 * 生成robots.txt
 * 告诉搜索引擎哪些页面可以爬取，哪些不可以
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.veo-ai.site'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // API路由不允许爬取
          '/admin/',         // 后台管理不允许爬取
          '/_next/',         // Next.js内部文件
          '/private/',       // 私有文件
        ],
      },
      // 针对百度爬虫的特殊规则
      {
        userAgent: 'Baiduspider',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
      // 针对谷歌爬虫的特殊规则
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
