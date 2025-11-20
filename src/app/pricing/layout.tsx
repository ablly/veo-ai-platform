import { Metadata } from "next"

export const metadata: Metadata = {
  title: "定价方案 - 支持支付宝和Stripe | VEO AI双引擎视频生成",
  description: "VEO AI提供灵活的积分套餐，支持支付宝（国内用户）和Stripe（海外用户）双支付系统。基础套餐49元起，使用SORA 2.0和VEO 3.1双AI引擎生成专业视频。新用户注册送10积分！",
  keywords: [
    "AI视频价格",
    "积分套餐",
    "支付宝充值",
    "Stripe支付",
    "视频生成费用",
    "SORA 2.0价格",
    "VEO 3.1价格",
    "AI视频套餐"
  ],
  openGraph: {
    title: "定价方案 - 支付宝+Stripe双支付 | VEO AI",
    description: "💳 支持支付宝和Stripe | ⚡ SORA 2.0 & VEO 3.1双引擎 | 💰 49元起 | 🎁 新用户送10积分",
    url: "https://www.veo-ai.site/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VEO AI定价 - 支付宝+Stripe双支付",
    description: "💳 双支付系统 | ⚡ 双AI引擎 | 💰 49元起",
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 结构化数据 - 产品定价
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "VEO AI 积分套餐",
    "description": "使用SORA 2.0和VEO 3.1双AI引擎生成专业视频的积分套餐",
    "brand": {
      "@type": "Brand",
      "name": "VEO AI"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "基础套餐",
        "price": "49",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "description": "50积分，可生成约3个视频"
      },
      {
        "@type": "Offer",
        "name": "专业套餐",
        "price": "99",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "description": "150积分，可生成约10个视频，最受欢迎"
      },
      {
        "@type": "Offer",
        "name": "企业套餐",
        "price": "299",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock",
        "description": "500积分，可生成约33个视频"
      }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "12000"
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
