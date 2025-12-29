import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "登录 - VEO AI双引擎视频生成平台",
  description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。支持邮箱、手机号验证码登录，安全便捷。",
  keywords: ["VEO AI登录", "视频生成平台登录", "AI视频登录", "SORA登录", "VEO登录"],
  alternates: {
    canonical: "https://www.veo-ai.site/login",
  },
  openGraph: {
    title: "登录 - VEO AI双引擎视频生成平台",
    description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。",
    url: "https://www.veo-ai.site/login",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "登录 - VEO AI双引擎视频生成平台",
    description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。",
  },
  robots: {
    index: true,
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
