import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { AuthProvider } from "@/components/providers/auth-provider"
import { ToastProvider } from "@/lib/toast-context"
import { Navigation } from "@/components/layout/navigation"
import "./globals.css";
import "./button-fix.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // 基础信息
  title: {
    default: "VEO AI - 双引擎AI视频生成平台 | SORA 2.0 & VEO 3.1 | 支付宝+Stripe",
    template: "%s | VEO AI"
  },
  description: "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台。支持支付宝（国内）和Stripe（海外）双支付系统，30-60秒极速生成专业视频。新用户注册送10积分，立即免费体验！",
  keywords: [
    "AI视频生成", "SORA 2.0", "VEO 3.1", "双引擎AI", "双AI模型",
    "文字生成视频", "AI视频制作", "在线视频生成", "智能视频创作",
    "支付宝充值", "Stripe支付", "国际支付", "双支付系统",
    "中国AI视频", "全球AI视频平台", "30秒生成视频", "极速视频生成",
    "OpenAI SORA", "Google VEO", "专业视频制作"
  ],
  authors: [{ name: "VEO AI Team", url: "https://www.veo-ai.site" }],
  creator: "VEO AI Team",
  publisher: "VEO AI",
  
  // 视口和格式
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  
  // 图标
  icons: {
    icon: [
      { url: '/icon.png?v=20251029', type: 'image/png' },
      { url: '/favicon.ico?v=20251029', sizes: 'any' }
    ],
    apple: '/icon.png?v=20251029',
  },
  
  // Open Graph (社交媒体分享)
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://www.veo-ai.site",
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
  
  // 机器人索引
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 规范链接
  alternates: {
    canonical: "https://www.veo-ai.site",
  },
  
  // 格式检测
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // 验证码（需要在各搜索引擎后台获取）
  verification: {
    google: "dg6AkvEoozvbl71VAMdEASHbA893w9ia76Xcu9VdoZY", // Google Search Console验证码
    // baidu: "", // 百度站长验证码（通过other添加）
    // bing: "", // Bing Webmaster Tools验证码（在下面other中添加）
  },
  
  // 其他meta标签
  other: {
    // 百度相关
    'baidu-site-verification': 'codeva-xDxG31avBF', // 百度站长验证码
    'baidu-tc-verification': '', // 百度统计验证码
    
    // 360搜索
    '360-site-verification': '', // 360站长验证码
    
    // 搜狗
    'sogou_site_verification': '', // 搜狗站长验证码
    
    // Bing/Microsoft
    'msvalidate.01': '', // Bing Webmaster Tools验证码
    
    // 移动端优化
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    
    // 特色标签
    'application-name': 'VEO AI',
    'msapplication-TileColor': '#6366f1',
    'theme-color': '#6366f1',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 主结构化数据 - SoftwareApplication (不包含offers，避免Google警告)
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VEO AI",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "url": "https://www.veo-ai.site",
    "image": "https://www.veo-ai.site/og-image.png",
    "screenshot": "https://www.veo-ai.site/og-image.png",
    "description": "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "12000",
      "bestRating": "5",
      "worstRating": "1"
    },
    "featureList": [
      "双AI引擎：SORA 2.0 + VEO 3.1",
      "双支付系统：支付宝 + Stripe",
      "30-60秒极速生成",
      "支持文字和图片输入",
      "专业级视频质量",
      "新用户送10积分"
    ],
    "author": {
      "@type": "Organization",
      "name": "VEO AI Team",
      "url": "https://www.veo-ai.site"
    },
    "softwareVersion": "2.0",
    "applicationSubCategory": "AI Video Generator",
    "downloadUrl": "https://www.veo-ai.site/register",
    "installUrl": "https://www.veo-ai.site/register"
  };

  // 组织结构化数据
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VEO AI",
    "url": "https://www.veo-ai.site",
    "logo": "https://www.veo-ai.site/icon.png",
    "description": "专业AI视频生成平台，集成SORA 2.0和VEO 3.1双引擎",
    "foundingDate": "2024",
    "sameAs": [
      "https://twitter.com/veoai"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "3533912007@qq.com",
      "contactType": "customer service",
      "availableLanguage": ["Chinese", "English"]
    }
  };

  // 网站结构化数据
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VEO AI",
    "url": "https://www.veo-ai.site",
    "description": "AI视频生成平台 - SORA 2.0 & VEO 3.1 双引擎",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.veo-ai.site/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["zh-CN", "en"]
  };

  // FAQ 结构化数据 - 添加name字段修复Google警告
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "VEO AI 常见问题",
    "description": "关于VEO AI视频生成平台的常见问题解答",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "VEO AI是什么？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VEO AI是全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台，支持文字生成视频和图片生成视频。"
        }
      },
      {
        "@type": "Question",
        "name": "如何使用VEO AI生成视频？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "注册账号后，输入文字描述或上传参考图片，选择AI模型（SORA 2.0或VEO 3.1），点击生成即可在30-60秒内获得专业视频。"
        }
      },
      {
        "@type": "Question",
        "name": "VEO AI支持哪些支付方式？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "支持支付宝（国内用户）和Stripe（海外用户，包括信用卡、Apple Pay等）双支付系统。"
        }
      },
      {
        "@type": "Question",
        "name": "新用户有什么优惠？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "新用户注册即送10积分，可免费生成1个SORA 2.0视频。首次充值还额外赠送50%积分！"
        }
      },
      {
        "@type": "Question",
        "name": "SORA 2.0和VEO 3.1有什么区别？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "SORA 2.0是OpenAI的视频生成模型，支持10-15秒视频，消耗10积分；VEO 3.1是Google的模型，生成5秒视频，消耗15积分。两者各有特色，可根据需求选择。"
        }
      }
    ]
  };

  // 面包屑结构化数据
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "首页",
        "item": "https://www.veo-ai.site"
      }
    ]
  };

  return (
    <html lang="zh-CN">
      <head>
        {/* 字符编码 */}
        <meta charSet="utf-8" />
        
        {/* 结构化数据 - 多Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        {/* 多语言支持 */}
        <link rel="alternate" hrefLang="zh-CN" href="https://www.veo-ai.site" />
        <link rel="alternate" hrefLang="en" href="https://www.veo-ai.site" />
        <link rel="alternate" hrefLang="x-default" href="https://www.veo-ai.site" />
        
        {/* 预连接优化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS预解析 */}
        <link rel="dns-prefetch" href="https://www.veo-ai.site" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ToastProvider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
