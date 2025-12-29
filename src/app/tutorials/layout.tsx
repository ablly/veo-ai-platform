import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "使用教程 - 如何用AI生成视频 | VEO AI",
  description: "详细的VEO AI使用教程，教你如何使用SORA 2.0和VEO 3.1双AI引擎生成专业视频。从入门到精通，快速掌握AI视频创作技巧。",
  keywords: ["AI视频教程", "SORA教程", "VEO教程", "视频生成教程", "AI创作指南", "视频制作教程"],
  alternates: {
    canonical: "https://www.veo-ai.site/tutorials",
  },
  openGraph: {
    title: "使用教程 - 如何用AI生成视频 | VEO AI",
    description: "详细的VEO AI使用教程，从入门到精通，快速掌握AI视频创作技巧。",
    url: "https://www.veo-ai.site/tutorials",
    siteName: "VEO AI",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary",
    title: "使用教程 - VEO AI",
    description: "详细的AI视频生成教程，快速掌握创作技巧。",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TutorialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 教程结构化数据
  const tutorialSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "如何使用VEO AI生成视频",
    "description": "详细的VEO AI使用教程，教你如何使用双AI引擎生成专业视频",
    "step": [
      {
        "@type": "HowToStep",
        "name": "注册账号",
        "text": "访问VEO AI官网，注册账号即送10积分"
      },
      {
        "@type": "HowToStep",
        "name": "输入描述",
        "text": "在生成页面输入您想要的视频描述"
      },
      {
        "@type": "HowToStep",
        "name": "选择模型",
        "text": "选择SORA 2.0或VEO 3.1引擎"
      },
      {
        "@type": "HowToStep",
        "name": "生成视频",
        "text": "点击生成按钮，30-60秒即可获得专业视频"
      }
    ],
    "totalTime": "PT2M"
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialSchema) }}
      />
      {children}
    </>
  )
}
