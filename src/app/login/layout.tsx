import { Metadata } from "next"

export const metadata: Metadata = {
  title: "登录 - VEO AI双引擎视频生成平台",
  description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。支持邮箱、手机号登录，支付宝和Stripe双支付系统。",
  keywords: [
    "VEO AI登录",
    "视频生成平台登录",
    "AI视频登录",
    "SORA登录",
    "VEO登录"
  ],
  openGraph: {
    title: "登录 VEO AI - 双引擎视频生成",
    description: "登录使用SORA 2.0和VEO 3.1双AI引擎创作视频",
    url: "https://www.veo-ai.site/login",
    type: "website",
  },
  robots: {
    index: false, // 登录页面不需要被索引
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
