import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "AI视频生成教程 - SORA 2.0 & VEO 3.1使用指南 | VEO AI",
  description: "学习如何使用VEO AI平台的SORA 2.0和VEO 3.1生成专业视频。从入门到精通的完整教程，包含提示词技巧、最佳实践和案例分析。",
  keywords: ["AI视频教程", "SORA教程", "VEO教程", "AI视频生成技巧", "提示词写法", "文生视频教程"],
  openGraph: {
    title: "AI视频生成教程 - VEO AI",
    description: "从入门到精通，学习AI视频生成的所有技巧",
    url: "https://www.veo-ai.site/tutorials",
  },
  alternates: {
    canonical: "https://www.veo-ai.site/tutorials",
  },
}

const tutorials = [
  {
    id: "getting-started",
    title: "新手入门：5分钟学会AI视频生成",
    description: "从注册账号到生成第一个视频，手把手教你使用VEO AI平台",
    difficulty: "入门",
    readTime: "5分钟",
    tags: ["入门", "基础"],
  },
  {
    id: "prompt-writing",
    title: "提示词写作技巧：让AI更懂你的想法",
    description: "学习如何编写高质量的提示词，生成更符合预期的视频内容",
    difficulty: "进阶",
    readTime: "10分钟",
    tags: ["提示词", "技巧"],
  },
  {
    id: "sora-vs-veo",
    title: "SORA 2.0 vs VEO 3.1：如何选择合适的模型",
    description: "深入对比两种AI模型的特点，帮你在不同场景下做出最佳选择",
    difficulty: "进阶",
    readTime: "8分钟",
    tags: ["SORA", "VEO", "对比"],
  },
  {
    id: "image-to-video",
    title: "图生视频：用参考图片提升视频质量",
    description: "学习如何利用参考图片功能，让AI生成更精准的视频内容",
    difficulty: "进阶",
    readTime: "7分钟",
    tags: ["图生视频", "技巧"],
  },
  {
    id: "commercial-use",
    title: "商业应用：AI视频在营销中的最佳实践",
    description: "探索AI视频在产品展示、广告制作、社交媒体等商业场景的应用",
    difficulty: "高级",
    readTime: "15分钟",
    tags: ["商业", "营销", "案例"],
  },
  {
    id: "troubleshooting",
    title: "问题排查：常见错误及解决方案",
    description: "遇到生成失败、质量不佳等问题？这里有完整的解决方案",
    difficulty: "入门",
    readTime: "6分钟",
    tags: ["问题", "解决方案"],
  },
]

const tips = [
  {
    icon: "💡",
    title: "描述要具体",
    content: "不要只说'一只猫'，而是说'一只橘色的波斯猫在阳光下的草地上慵懒地打滚'"
  },
  {
    icon: "🎨",
    title: "指定风格",
    content: "添加风格描述如'电影感'、'动漫风格'、'写实主义'可以大幅提升效果"
  },
  {
    icon: "📐",
    title: "选对比例",
    content: "短视频用9:16，YouTube用16:9，Instagram用1:1"
  },
  {
    icon: "🖼️",
    title: "善用参考图",
    content: "上传参考图片可以让AI更准确理解你想要的画面风格和色调"
  },
]

export default function TutorialsPage() {
  // 教程页面结构化数据
  const tutorialStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "VEO AI视频生成教程",
    "description": "AI视频生成完整教程列表",
    "numberOfItems": tutorials.length,
    "itemListElement": tutorials.map((tutorial, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "HowTo",
        "name": tutorial.title,
        "description": tutorial.description,
        "totalTime": `PT${parseInt(tutorial.readTime)}M`
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tutorialStructuredData) }}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            AI视频生成教程
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            从入门到精通，学习使用SORA 2.0和VEO 3.1创作专业视频的所有技巧
          </p>
        </div>

        {/* 快速技巧 */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ⚡ 快速技巧
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-3">{tip.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-sm text-gray-600">{tip.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 教程列表 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📚 完整教程
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial) => (
              <article 
                key={tutorial.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tutorial.difficulty === "入门" ? "bg-green-100 text-green-700" :
                      tutorial.difficulty === "进阶" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {tutorial.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      ⏱️ {tutorial.readTime}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {tutorial.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {tutorial.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {tutorial.tags.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开始创作了吗？
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            新用户注册即送10积分，立即体验SORA 2.0和VEO 3.1的强大能力
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-block bg-white text-indigo-600 font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              免费注册
            </Link>
            <Link
              href="/generate"
              className="inline-block bg-white/20 text-white font-bold py-3 px-8 rounded-full hover:bg-white/30 transition-colors border border-white/30"
            >
              开始生成
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
