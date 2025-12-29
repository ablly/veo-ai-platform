import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "我的视频 - VEO AI视频管理",
  description: "管理您在VEO AI生成的所有视频，支持预览、下载、分享和续作功能。查看您的AI视频创作历史。",
  keywords: ["我的视频", "视频管理", "视频下载", "视频分享", "AI视频历史"],
  alternates: {
    canonical: "https://www.veo-ai.site/my-videos",
  },
  openGraph: {
    title: "我的视频 - VEO AI视频管理",
    description: "管理您在VEO AI生成的所有视频。",
    url: "https://www.veo-ai.site/my-videos",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  robots: {
    index: false, // 用户私人页面不索引
    follow: true,
  },
}

export default function MyVideosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
