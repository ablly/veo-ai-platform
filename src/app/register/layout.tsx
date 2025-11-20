import { Metadata } from "next"

export const metadata: Metadata = {
  title: "注册送10积分 - VEO AI双引擎视频生成平台",
  description: "注册VEO AI即送10积分，免费体验SORA 2.0和VEO 3.1双AI引擎视频生成。支持支付宝和Stripe充值，30-60秒极速生成专业视频。",
  keywords: [
    "VEO AI注册",
    "免费视频生成",
    "新用户福利",
    "注册送积分",
    "AI视频注册",
    "SORA注册",
    "VEO注册"
  ],
  openGraph: {
    title: "注册VEO AI - 送10积分免费体验",
    description: "🎁 新用户送10积分 | ⚡ SORA 2.0 & VEO 3.1双引擎 | 💳 支付宝+Stripe",
    url: "https://www.veo-ai.site/register",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "注册VEO AI - 送10积分",
    description: "🎁 免费体验双AI引擎视频生成",
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 结构化数据 - 注册优惠
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Offer",
    "name": "VEO AI 新用户注册优惠",
    "description": "注册即送10积分，可免费生成1个SORA 2.0视频",
    "price": "0",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock",
    "eligibleCustomerType": "https://schema.org/NewCustomer",
    "priceValidUntil": "2025-12-31",
    "seller": {
      "@type": "Organization",
      "name": "VEO AI"
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {children}
    </>
  )
}
