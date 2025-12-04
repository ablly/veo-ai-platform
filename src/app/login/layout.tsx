import { Metadata } from "next"

export const metadata: Metadata = {
  title: "登录 - VEO AI双引擎视频生成平台",
  description: "登录VEO AI，使用SORA 2.0和VEO 3.1双AI引擎创作专业视频。支持邮箱、手机号、验证码多种登录方式。",
  keywords: ["VEO AI登录", "视频生成平台登录", "AI视频登录"],
  openGraph: {
    title: "登录 - VEO AI双引擎视频生成平台",
    description: "登录VEO AI，开始AI视频创作之旅",
    url: "https://www.veo-ai.site/login",
    type: "website",
  },
  alternates: {
    canonical: "https://www.veo-ai.site/login",
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
