import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  
  // 验证码（需要在各搜索引擎后台获取）
  verification: {
    google: "dg6AkvEoozvbl71VAMdEASHbA893w9ia76Xcu9VdoZY", // Google Search Console验证码
    // baidu: "", // 百度站长验证码（通过other添加）
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
  // 结构化数据 (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VEO AI",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web",
    "url": "https://www.veo-ai.site",
    "description": "全球首家集成OpenAI SORA 2.0与Google VEO 3.1双AI引擎的视频生成平台",
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
    }
  };

  return (
    <html lang="zh-CN">
      <head>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
      </body>
    </html>
  );
}
