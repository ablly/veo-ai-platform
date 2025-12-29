import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "常见问题 - VEO AI双引擎视频生成平台",
  description: "VEO AI常见问题解答，包括账户注册、积分充值、视频生成、支付方式等问题的详细解答。快速找到您需要的答案。",
  keywords: ["VEO AI FAQ", "常见问题", "视频生成问题", "积分问题", "支付问题", "帮助中心"],
  alternates: {
    canonical: "https://www.veo-ai.site/faq",
  },
  openGraph: {
    title: "常见问题 - VEO AI双引擎视频生成平台",
    description: "VEO AI常见问题解答，快速找到您需要的答案。",
    url: "https://www.veo-ai.site/faq",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "常见问题 - VEO AI",
    description: "VEO AI常见问题解答，快速找到您需要的答案。",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
