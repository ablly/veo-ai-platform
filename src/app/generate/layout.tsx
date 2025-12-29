import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI视频生成 - SORA 2.0 & VEO 3.1双引擎 | VEO AI",
  description: "使用VEO AI的SORA 2.0和VEO 3.1双AI引擎，30-60秒极速生成专业视频。支持文字生成视频、图片生成视频，多种宽高比可选。",
  keywords: ["AI视频生成", "SORA 2.0视频", "VEO 3.1视频", "文字生成视频", "图片生成视频", "AI视频制作", "在线视频生成"],
  alternates: {
    canonical: "https://www.veo-ai.site/generate",
  },
  openGraph: {
    title: "AI视频生成 - SORA 2.0 & VEO 3.1双引擎 | VEO AI",
    description: "使用双AI引擎30-60秒极速生成专业视频，支持文字和图片输入。",
    url: "https://www.veo-ai.site/generate",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI视频生成 - SORA 2.0 & VEO 3.1双引擎",
    description: "使用双AI引擎30-60秒极速生成专业视频。",
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
