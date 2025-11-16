"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { HelpCircle, Zap, Film, CreditCard, Shield, Download, Share2, BookOpen, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AnimatedBackground } from "@/components/ui/animated-background"

interface FAQ {
  question: string
  answer: string
  category: string
  icon: React.ComponentType<{ className?: string }>
}

const faqs: FAQ[] = [
  {
    category: "使用指南",
    icon: Zap,
    question: "平台支持哪些AI模型？",
    answer: "我们集成了两大顶级AI模型：1) SORA 2.0（OpenAI）- 推荐模型，支持10-15秒时长，更多自定义选项；2) VEO 3.1（Google）- 专业模型，5秒时长，质量稳定。您可以根据需求自由切换使用。"
  },
  {
    category: "使用指南",
    icon: Zap,
    question: "如何使用平台生成视频？",
    answer: "简单三步：1) 选择AI模型（SORA 2.0或VEO 3.1）；2) 输入视频描述，可选上传参考图片（最多6张）；3) 点击生成按钮，等待30-60秒即可获得视频。新用户注册即送10积分，可免费生成1次SORA 2.0视频！"
  },
  {
    category: "使用指南",
    icon: Film,
    question: "SORA 2.0 和 VEO 3.1 有什么区别？",
    answer: "SORA 2.0：支持10-15秒时长，可自定义清晰度和比例，适合需要精细控制的创作。VEO 3.1：5秒时长，生成速度更快，质量稳定，适合快速出片。两个模型各有特色，您可以根据创作需求自由选择。"
  },
  {
    category: "使用指南",
    icon: Film,
    question: "可以上传什么类型的图片？",
    answer: "支持JPG、PNG、WebP格式的图片，每张最大5MB。您可以上传照片、艺术作品、草图等任何视觉内容。AI最多可处理6张参考图片，以更好地理解您的创意需求。"
  },
  {
    category: "使用指南",
    icon: Film,
    question: "如何获得最佳生成效果？",
    answer: "1) 选择合适的模型：快速出片用VEO 3.1，精细创作用SORA 2.0；2) 使用清晰、具体的描述；3) 描述画面细节、风格、氛围；4) 上传高质量的参考图片；5) 避免过于复杂或矛盾的描述；6) 参考视频广场中的优质案例。"
  },
  {
    category: "使用指南",
    icon: Zap,
    question: "SORA 2.0 有哪些高级功能？",
    answer: "SORA 2.0 支持更多自定义选项：1) 时长选择：10秒或15秒；2) 比例选择：16:9或9:16；3) 清晰度选择：标清或高清；4) 续作功能：基于已有视频继续创作。这些功能让您对视频有更精细的控制。"
  },
  {
    category: "积分系统",
    icon: CreditCard,
    question: "新用户有什么福利？",
    answer: "🎁 新用户注册即送10积分！可免费生成1次SORA 2.0视频（不上传图片的情况下）。这是体验我们平台最好的方式，无需信用卡，立即注册即可开始创作！"
  },
  {
    category: "积分系统",
    icon: CreditCard,
    question: "积分如何收费？",
    answer: "购买积分套餐：新手体验套餐¥6.6/5积分，基础套餐¥49/50积分，专业套餐¥99/150积分，企业套餐¥299/500积分。生成视频时会根据所选模型和上传的图片数量自动扣除相应积分。"
  },
  {
    category: "积分系统",
    icon: CreditCard,
    question: "积分有效期多久？",
    answer: "免费赠送的积分有效期为30天，新手体验套餐积分7天，基础套餐积分30天，专业套餐90天，企业套餐180天。请在有效期内使用您的积分。"
  },
  {
    category: "视频管理",
    icon: Download,
    question: "如何下载生成的视频？",
    answer: "视频生成完成后，在结果页面或\"我的视频\"页面点击下载按钮即可保存到本地。支持MP4格式，高清质量。所有视频永久保存，随时可下载。"
  },
  {
    category: "视频管理",
    icon: Share2,
    question: "可以分享我的视频吗？",
    answer: "可以！您可以在\"我的视频\"页面将视频分享到视频广场，让其他用户欣赏您的创作。分享的视频会公开显示，您也可以随时取消分享。"
  },
  {
    category: "视频管理",
    icon: Film,
    question: "可以删除已生成的视频吗？",
    answer: "可以。在\"我的视频\"页面，每个视频都有删除选项。删除操作不可恢复，请谨慎操作。删除视频不会返还积分。"
  },
  {
    category: "账号安全",
    icon: Shield,
    question: "我的数据安全吗？",
    answer: "绝对安全！所有上传内容都经过加密存储，我们绝不会将您的内容用于AI模型训练或与第三方分享。您可以随时删除您的数据，完全符合GDPR等隐私法规。"
  },
  {
    category: "账号安全",
    icon: Shield,
    question: "忘记密码怎么办？",
    answer: "您可以使用邮箱验证码或手机验证码登录，无需密码。登录后可在个人中心修改密码。我们也支持微信快捷登录。"
  },
  {
    category: "账号安全",
    icon: Shield,
    question: "如何修改个人信息？",
    answer: "登录后访问\"个人中心\"，可以修改头像、昵称等信息。邮箱和手机号绑定后不可更改，如需修改请联系客服。"
  },
  {
    category: "商业使用",
    icon: Film,
    question: "生成的视频可以商用吗？",
    answer: "可以！无论使用SORA 2.0还是VEO 3.1生成的视频，完全归您所有，可用于任何商业用途，无需额外授权费用。但请确保您的描述和参考图片不侵犯他人版权。"
  },
  {
    category: "商业使用",
    icon: Film,
    question: "视频版权归谁所有？",
    answer: "您拥有生成视频的完整版权。我们的平台不会声称对您生成的内容拥有任何权利。您可以自由使用、修改、出售您的视频作品，无论是用SORA 2.0还是VEO 3.1生成的。"
  },
  {
    category: "商业使用",
    icon: Film,
    question: "可以批量生成视频吗？",
    answer: "可以。如有批量生成需求，建议购买企业套餐（1000积分/¥599）。每次仍需单独提交。"
  },
  {
    category: "故障排除",
    icon: HelpCircle,
    question: "视频生成失败怎么办？",
    answer: "可能原因：1) 积分不足；2) 描述包含违规内容；3) 系统暂时故障。请检查积分余额，修改描述后重试，或尝试切换另一个模型，或稍后再试。如问题持续，请联系客服。"
  },
  {
    category: "故障排除",
    icon: HelpCircle,
    question: "为什么生成速度很慢？",
    answer: "正常生成时间为30-60秒。如果超过2分钟仍未完成，可能是服务器负载较高。请耐心等待，不要重复提交。如长时间无响应，请刷新页面或联系客服。"
  },
  {
    category: "故障排除",
    icon: HelpCircle,
    question: "上传图片失败怎么办？",
    answer: "请检查：1) 图片格式是否为JPG/PNG/WebP；2) 单张图片大小不超过5MB；3) 网络连接是否正常。如仍失败，尝试压缩图片或更换图片格式。"
  },
]

export default function DocsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const categories = [
    { id: "all", name: "全部", count: faqs.length },
    ...Array.from(new Set(faqs.map(f => f.category))).map(cat => ({
      id: cat,
      name: cat,
      count: faqs.filter(f => f.category === cat).length
    }))
  ]
  
  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              帮助中心
            </span>
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            使用指南
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            快速了解如何使用 SORA 2.0 & VEO 3.1 双模型平台
          </p>
        </motion.div>

        {/* Quick Start Guide */}
        <motion.div
          className="max-w-5xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-yellow-400/10 to-orange-500/10 backdrop-blur-md border-yellow-400/30 overflow-hidden">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                🚀 快速开始
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-2xl">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">选择模型</h3>
                  <p className="text-white/70 text-sm">
                    SORA 2.0（推荐）或 VEO 3.1（专业）
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-2xl">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">输入描述</h3>
                  <p className="text-white/70 text-sm">
                    详细描述您想要的视频内容
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-2xl">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">生成视频</h3>
                  <p className="text-white/70 text-sm">
                    30-60秒即可获得专业视频
                  </p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <a
                  href="/"
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  立即开始创作
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              type="text"
              placeholder="搜索问题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/50 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 rounded-lg text-lg"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {categories.map((cat, index) => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-yellow-400 text-black"
                  : "bg-white/10 text-white hover:bg-white/20 border border-white/30"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
            >
              {cat.name}
              <span className="ml-2 text-sm opacity-70">({cat.count})</span>
            </motion.button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div
          className="max-w-4xl mx-auto space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {filteredFAQs.length === 0 ? (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <HelpCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 text-lg">
                没有找到相关问题，请尝试其他关键词
              </p>
            </motion.div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const Icon = faq.icon
              return (
                <motion.details
                  key={index}
                  className="group bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <summary className="px-6 py-5 cursor-pointer list-none flex items-center justify-between text-white font-medium text-lg hover:bg-white/5 transition-all">
                    <span className="flex items-center flex-1">
                      <span className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center mr-4 text-yellow-400 group-hover:bg-yellow-400/30 transition-all">
                        <Icon className="w-5 h-5" />
                      </span>
                      {faq.question}
                    </span>
                    <span className="text-yellow-400 ml-4 group-open:rotate-180 transition-transform duration-300">
                      ▼
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-white/80 leading-relaxed border-t border-white/10 bg-black/10">
                    <div className="pl-14">
                      {faq.answer}
                    </div>
                  </div>
                </motion.details>
              )
            })
          )}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="max-w-2xl mx-auto mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-8">
              <HelpCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">
                还没找到答案？
              </h3>
              <p className="text-white/70 mb-6 leading-relaxed">
                如果您的问题没有在这里找到答案，欢迎访问个人中心或联系我们的客服团队
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="/profile"
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  访问个人中心
                </a>
                <a
                  href="/"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all border border-white/30"
                >
                  返回首页
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
