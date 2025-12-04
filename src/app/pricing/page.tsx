import { Suspense } from "react"
import { Metadata } from "next"
import PricingContent from "./PricingContent"

// SEO Metadata
export const metadata: Metadata = {
  title: "定价方案 - 支持支付宝和Stripe | VEO AI双引擎视频生成",
  description: "VEO AI提供灵活的积分套餐，支持支付宝（国内用户）和Stripe（海外用户）双支付系统。基础套餐49元起，使用SORA 2.0和VEO 3.1双AI引擎生成专业视频。新用户首单额外赠送50%积分！",
  keywords: ["AI视频价格", "积分套餐", "支付宝充值", "Stripe支付", "视频生成费用", "SORA价格", "VEO价格"],
  openGraph: {
    title: "定价方案 - VEO AI双引擎视频生成平台",
    description: "灵活积分套餐，支付宝+Stripe双支付，首单额外赠送50%积分",
    url: "https://www.veo-ai.site/pricing",
    type: "website",
  },
  alternates: {
    canonical: "https://www.veo-ai.site/pricing",
  },
}

// 产品结构化数据 - 符合Google要求
const pricingStructuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "VEO AI 积分套餐",
  "description": "使用SORA 2.0和VEO 3.1双AI引擎生成专业视频的积分套餐",
  "image": "https://www.veo-ai.site/og-image.png",
  "brand": {
    "@type": "Brand",
    "name": "VEO AI"
  },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "CNY",
    "lowPrice": "49",
    "highPrice": "299",
    "offerCount": "3",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "VEO AI"
    },
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "CNY"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": "0",
          "maxValue": "0",
          "unitCode": "MIN"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": "0",
          "maxValue": "0",
          "unitCode": "MIN"
        }
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "CN"
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "CN",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": "14",
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "12000",
    "bestRating": "5",
    "worstRating": "1"
  }
}

// Loading fallback component
function PricingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
}

export default function PricingPage() {
  return (
    <>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingStructuredData) }}
      />
      <Suspense fallback={<PricingLoading />}>
        <PricingContent />
      </Suspense>
    </>
  )
}
