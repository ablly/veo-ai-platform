/**
 * SEO配置文件
 * 集中管理网站的SEO元数据，突出双引擎和双支付特色
 */

export const SEO_CONFIG = {
  // 网站基本信息
  siteName: "VEO AI",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.veo-ai.site",
  
  // 核心特色关键词
  keywords: [
    // 主关键词
    "AI视频生成",
    "SORA 2.0",
    "VEO 3.1",
    "双引擎AI",
    "双AI模型",
    
    // 功能关键词
    "文字生成视频",
    "AI视频制作",
    "在线视频生成",
    "智能视频创作",
    "AI视频编辑",
    
    // 支付相关
    "支付宝充值",
    "Stripe支付",
    "国际支付",
    "双支付系统",
    
    // 地域关键词
    "中国AI视频",
    "全球AI视频平台",
    
    // 长尾关键词
    "30秒生成视频",
    "极速视频生成",
    "专业视频制作",
    "OpenAI SORA",
    "Google VEO"
  ],
  
  // 默认元数据
  defaultMetadata: {
    title: "VEO AI - 双引擎AI视频生成平台 | SORA 2.0 & VEO 3.1",
    description: "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台。支持支付宝（国内）和Stripe（海外）双支付系统，30-60秒极速生成专业视频。新用户注册送10积分，立即免费体验！",
    keywords: "AI视频生成,SORA 2.0,VEO 3.1,双引擎AI,文字生成视频,支付宝充值,Stripe支付",
  },
  
  // Open Graph (社交媒体分享)
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    siteName: "VEO AI - 双引擎AI视频生成平台",
    title: "VEO AI - SORA 2.0 & VEO 3.1 双引擎AI视频生成",
    description: "⚡ 双AI引擎：SORA 2.0 + VEO 3.1 | 💳 双支付：支付宝 + Stripe | 🚀 30-60秒极速生成 | 🎁 新用户送10积分",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VEO AI - 双引擎AI视频生成平台",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@veoai",
    creator: "@veoai",
    title: "VEO AI - 双引擎AI视频生成平台",
    description: "⚡ SORA 2.0 & VEO 3.1 双引擎 | 💳 支付宝 + Stripe | 🚀 30-60秒生成",
    images: ["/twitter-image.png"],
  },
  
  // 百度、搜狗等国内搜索引擎
  baidu: {
    siteVerification: "", // 百度站长验证码
    keywords: "AI视频生成,SORA视频,VEO视频,双引擎AI,支付宝充值,文字生成视频",
    description: "VEO AI是全球首家集成SORA 2.0和VEO 3.1双AI引擎的视频生成平台，支持支付宝和Stripe双支付，30秒极速生成专业视频",
  },
  
  // 结构化数据 (Schema.org)
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VEO AI",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "CNY",
      "lowPrice": "49",
      "highPrice": "299",
      "offerCount": "3"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台",
    "featureList": [
      "双AI引擎：SORA 2.0 + VEO 3.1",
      "双支付系统：支付宝 + Stripe",
      "30-60秒极速生成",
      "支持文字和图片输入",
      "专业级视频质量",
      "新用户送10积分"
    ],
    "screenshot": "/screenshot.png",
    "softwareVersion": "2.0",
    "author": {
      "@type": "Organization",
      "name": "VEO AI Team"
    }
  },
  
  // 页面特定SEO配置
  pages: {
    home: {
      title: "VEO AI - 双引擎AI视频生成平台 | SORA 2.0 & VEO 3.1 | 支付宝+Stripe",
      description: "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台。支持支付宝（国内）和Stripe（海外）双支付系统，30-60秒极速生成专业视频。新用户注册送10积分，立即免费体验！",
      keywords: "AI视频生成,SORA 2.0,VEO 3.1,双引擎AI,文字生成视频,支付宝充值,Stripe支付,在线视频制作",
    },
    pricing: {
      title: "定价方案 - 支持支付宝和Stripe | VEO AI双引擎视频生成",
      description: "VEO AI提供灵活的积分套餐，支持支付宝（国内用户）和Stripe（海外用户）双支付系统。基础套餐49元起，使用SORA 2.0和VEO 3.1双AI引擎生成专业视频。",
      keywords: "AI视频价格,积分套餐,支付宝充值,Stripe支付,视频生成费用",
    },
    login: {
      title: "登录 - VEO AI双引擎视频生成平台",
      description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。支持邮箱、手机号登录。",
      keywords: "VEO AI登录,视频生成平台登录",
    },
    register: {
      title: "注册送10积分 - VEO AI双引擎视频生成平台",
      description: "注册VEO AI即送10积分，免费体验SORA 2.0和VEO 3.1双AI引擎视频生成。支持支付宝和Stripe充值。",
      keywords: "VEO AI注册,免费视频生成,新用户福利",
    },
  },
}

/**
 * 生成页面元数据
 */
export function generateMetadata(page: keyof typeof SEO_CONFIG.pages) {
  const pageConfig = SEO_CONFIG.pages[page]
  const baseUrl = SEO_CONFIG.siteUrl
  
  return {
    title: pageConfig.title,
    description: pageConfig.description,
    keywords: pageConfig.keywords,
    
    // Open Graph
    openGraph: {
      ...SEO_CONFIG.openGraph,
      title: pageConfig.title,
      description: pageConfig.description,
      url: `${baseUrl}/${page === 'home' ? '' : page}`,
    },
    
    // Twitter
    twitter: {
      ...SEO_CONFIG.twitter,
      title: pageConfig.title,
      description: pageConfig.description,
    },
    
    // 其他
    alternates: {
      canonical: `${baseUrl}/${page === 'home' ? '' : page}`,
    },
  }
}
