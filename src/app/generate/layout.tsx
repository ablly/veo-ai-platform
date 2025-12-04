import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI视频生成 - SORA 2.0 & VEO 3.1 双引擎 | VEO AI",
  description: "使用VEO AI的SORA 2.0和VEO 3.1双AI引擎，将文字描述转化为专业视频。支持文生视频、图+文生视频，30-60秒极速生成。",
  keywords: ["AI视频生成", "文字生成视频", "SORA视频生成", "VEO视频生成", "AI视频制作", "在线视频生成"],
  openGraph: {
    title: "AI视频生成 - VEO AI双引擎平台",
    description: "⚡ SORA 2.0 + VEO 3.1 双引擎 | 🚀 30-60秒极速生成 | 📹 专业级视频质量",
    url: "https://www.veo-ai.site/generate",
    type: "website",
  },
  alternates: {
    canonical: "https://www.veo-ai.site/generate",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function GenerateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
