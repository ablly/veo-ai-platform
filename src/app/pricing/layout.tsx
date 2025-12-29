import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "定价方案 - 支持支付宝和Stripe | VEO AI双引擎视频生成",
  description: "VEO AI提供灵活的积分套餐，支持支付宝（国内用户）和Stripe（海外用户）双支付系统。基础套餐49元起，使用SORA 2.0和VEO 3.1双AI引擎生成专业视频。",
  keywords: ["AI视频价格", "积分套餐", "支付宝充值", "Stripe支付", "视频生成费用", "VEO AI定价"],
  alternates: {
    canonical: "https://www.veo-ai.site/pricing",
  },
  openGraph: {
    title: "定价方案 - VEO AI双引擎视频生成",
    description: "灵活的积分套餐，支持支付宝和Stripe双支付系统。基础套餐49元起。",
    url: "https://www.veo-ai.site/pricing",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "定价方案 - VEO AI",
    description: "灵活的积分套餐，支持支付宝和Stripe双支付系统。",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 定价结构化数据
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "VEO AI 积分套餐",
    "description": "AI视频生成积分套餐，支持SORA 2.0和VEO 3.1双引擎",
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
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "标准套餐",
        "price": "99",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer",
        "name": "专业套餐",
        "price": "299",
        "priceCurrency": "CNY",
        "availability": "https://schema.org/InStock"
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      {children}
    </>
  )
}
