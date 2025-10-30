"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { VideoShowcase } from "@/components/ui/video-showcase"
import { FloatingElements } from "@/components/ui/floating-elements"
import { motion } from "framer-motion"
import { Zap, Film, Sparkles, ArrowRight, CheckCircle, Image, Type, Download, Play } from "lucide-react"

interface GenerationData {
  prompt: string
  images: File[]
  isGenerating: boolean
  result?: {
    videoUrl: string
    id: string
    createdAt: string
  }
}

export default function HomePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [generationData, setGenerationData] = useState<GenerationData>({
    prompt: "",
    images: [],
    isGenerating: false
  })
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(true)

  const handleStartCreating = () => {
    if (session) {
      // 滚动到生成工具区域
      document.getElementById('generate-tool')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push("/login")
    }
  }

  const handleGenerate = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (!generationData.prompt.trim()) {
      alert("请输入视频描述")
      return
    }

    // 计算所需积分
    const baseCredits = 15
    const imageCredits = generationData.images.length * 5
    const totalCredits = baseCredits + imageCredits

    // 检查积分是否足够
    if (userCredits !== null && userCredits < totalCredits) {
      alert("积分不足，请充值")
      return
    }
    
    setGenerationData(prev => ({ ...prev, isGenerating: true }))
    
    try {
      // 上传图像（如果有）
      const uploadedImages = []
      for (const image of generationData.images) {
        const formData = new FormData()
        formData.append("file", image)
        
        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          uploadedImages.push(uploadData.data.url)
        }
      }

      // 调用视频生成API
      const response = await fetch("/api/generate/video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: generationData.prompt,
          images: uploadedImages
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "生成失败")
      }

      // 轮询检查生成状态
      const taskId = data.taskId || data.data?.taskId
      const pollStatus = async (): Promise<void> => {
        const statusResponse = await fetch(`/api/generate/video?taskId=${taskId}`)
        const statusData = await statusResponse.json()

        if (statusData.data.status === "completed" && statusData.data.videoUrl) {
          setGenerationData(prev => ({
            ...prev,
            isGenerating: false,
            result: {
              videoUrl: statusData.data.videoUrl,
              id: taskId,
              createdAt: statusData.data.createdAt
            }
          }))
        } else if (statusData.data.status === "failed") {
          throw new Error("视频生成失败")
        } else {
          // 继续轮询
          setTimeout(pollStatus, 3000)
        }
      }

      // 开始轮询
      setTimeout(pollStatus, 3000)

    } catch (error) {
      console.error("生成失败:", error)
      
      let errorMessage = "生成失败，请稍后重试"
      if (error instanceof Error) {
        errorMessage = error.message
        
        // 特殊错误处理
        if (error.message.includes("余额不足")) {
          errorMessage = "⚠️ 服务暂时不可用\n\nAPI服务商账户余额不足，管理员正在处理中。\n请稍后重试或联系客服。"
        } else if (error.message.includes("积分不足")) {
          errorMessage = "💳 积分不足，请充值"
        } else if (error.message.includes("过期")) {
          errorMessage = "⏰ 套餐已过期\n\n" + error.message + "\n\n请续费后继续使用"
        }
      }
      
      alert(errorMessage)
      setGenerationData(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // 获取用户积分余额
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session) {
        setLoadingCredits(false)
        return
      }
      
      try {
        const response = await fetch("/api/user/credits/balance")
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits.available)
        } else {
          console.error("获取积分失败:", response.status)
        }
      } catch (error) {
        console.error("获取积分失败:", error)
      } finally {
        setLoadingCredits(false)
      }
    }

    fetchCredits()
  }, [session])

  // 预加载关键页面
  useEffect(() => {
    router.prefetch("/login")
    router.prefetch("/register")
  }, [router])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />
      
      {/* 电脑端优先提示区域 */}
      <section className="relative container mx-auto px-4 pt-6 pb-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-3">
            <div className="flex items-center justify-center space-x-3">
              <span className="text-lg">💻</span>
              <p className="text-sm text-white/90">
                <span className="font-semibold text-yellow-400">建议使用电脑端访问</span>
                <span className="text-white/70 ml-2 hidden sm:inline">以获得最佳体验</span>
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20">
        <FloatingElements />
        <div className="text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                基于VEO 3.1最新模型
              </span>
            </motion.div>
            
            <h1 className="text-7xl md:text-8xl font-bold mb-8 text-white leading-tight">
              <span className="inline-block">VEO</span>{" "}
              <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI
              </span>
              <br />
              <span className="text-5xl md:text-6xl">视频创作平台</span>
            </h1>
            
            <p className="text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              革命性的AI视频生成技术，将您的创意转化为专业级视频内容
              <br />
              <span className="text-lg font-medium text-yellow-400">仅需3-5分钟，从文字到视频的完美蜕变</span>
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <button
              onClick={handleStartCreating}
              className="btn-primary-fixed btn-gradient-yellow inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold px-8 py-4 text-lg group shadow-lg border-0 transition-all hover:shadow-xl h-auto"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              {session ? "立即开始创作" : "登录开始创作"}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* 视频展示 */}
          <motion.div
            className="max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <VideoShowcase />
          </motion.div>
        </div>
      </section>

      {/* 生成工具区域 - 参考NanoBanana */}
      <section id="generate-tool" className="relative container mx-auto px-4 py-16 -mt-8">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center space-x-2 bg-yellow-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/30"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">
                AI驱动的视频生成
              </span>
            </motion.div>
            <h2 className="text-4xl font-bold text-white mb-3">
              用文字描述，让AI为您创作
            </h2>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              输入您的创意描述，上传参考图片（可选），AI将在30-60秒内生成专业视频
            </p>
          </div>

          {/* 并排布局：生成工具 + 视频展示 */}
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* 左侧：生成工具 */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-white text-center">
                  创作工具
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* 文字描述输入 */}
              <div className="space-y-3">
                <label className="flex items-center text-white font-medium text-sm">
                  <Type className="w-4 h-4 mr-2 text-yellow-400" />
                  描述您想要的视频内容
                </label>
                <textarea
                  value={generationData.prompt}
                  onChange={(e) => setGenerationData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="例如：一只可爱的小猫在草地上玩耍，阳光明媚，卡通风格，色彩鲜艳..."
                  className="w-full h-32 px-4 py-3 bg-white/5 border border-white/30 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 resize-none backdrop-blur-sm"
                  maxLength={500}
                  disabled={generationData.isGenerating}
                />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/50">
                    {generationData.prompt.length}/500 字符
                  </span>
                </div>
              </div>

              {/* 参考图片上传 */}
              <div className="space-y-3">
                <label className="flex items-center text-white font-medium text-sm">
                  <Image className="w-4 h-4 mr-2 text-yellow-400" />
                  参考图片 (可选，最多6张)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {generationData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`参考图${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border-2 border-white/30"
                      />
                      <button
                        onClick={() => {
                          setGenerationData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                          }))
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        disabled={generationData.isGenerating}
                      >
                        <span className="text-white text-xs">×</span>
                      </button>
                    </div>
                  ))}
                  
                  {generationData.images.length < 6 && (
                    <label className="aspect-square border-2 border-dashed border-white/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-white/5 transition-all">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          setGenerationData(prev => ({
                            ...prev,
                            images: [...prev.images, ...files].slice(0, 6)
                          }))
                          e.target.value = ''
                        }}
                        className="hidden"
                        disabled={generationData.isGenerating}
                        multiple
                      />
                      <Image className="w-6 h-6 text-white/50 mb-1" />
                      <span className="text-xs text-white/50">上传</span>
                    </label>
                  )}
                </div>
                <p className="text-xs text-white/50">
                  💡 上传参考图片可以帮助AI更好地理解您的需求（支持JPG/PNG/WebP，每张最大5MB）
                </p>
              </div>

              {/* 积分信息显示 */}
              {session && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 mb-4">
                  <div className="space-y-3">
                    {/* 当前积分余额 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-white/80">
                        <motion.div
                          className="w-4 h-4 bg-yellow-400 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <span>当前积分余额:</span>
                      </div>
                      <div className="text-sm font-bold">
                        {loadingCredits ? (
                          <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : userCredits !== null ? (
                          <span className={userCredits >= (15 + generationData.images.length * 5) ? "text-green-400" : "text-red-400"}>
                            {userCredits} 积分
                          </span>
                        ) : (
                          <span className="text-white/50">获取失败</span>
                        )}
                      </div>
                    </div>


                    {/* 积分不足提示 */}
                    {userCredits !== null && userCredits < (15 + generationData.images.length * 5) && (
                      <div className="flex items-center space-x-2 text-sm text-red-400 bg-red-500/20 p-3 rounded-lg border border-red-500/30">
                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <span>积分不足，请充值</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 生成按钮 */}
              <div className="pt-4">
                {session ? (
                  <Button
                    onClick={handleGenerate}
                    disabled={!generationData.prompt.trim() || generationData.isGenerating || (userCredits !== null && userCredits < (15 + generationData.images.length * 5))}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generationData.isGenerating ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        生成中，请稍候...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        开始生成视频
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/login")}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    登录开始创作（免费获得10积分）
                  </Button>
                )}
              </div>

              {/* 生成结果 */}
              {generationData.result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-6 bg-white/5 rounded-lg border border-white/20"
                >
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    生成成功！
                  </h3>
                  <video
                    src={generationData.result.videoUrl}
                    controls
                    className="w-full rounded-lg"
                  />
                  <div className="mt-4 flex gap-3">
                    <Button
                      onClick={() => {
                        const a = document.createElement('a')
                        a.href = generationData.result!.videoUrl
                        a.download = `veo-ai-${generationData.result!.id}.mp4`
                        a.click()
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white"
                    >
                      下载视频
                    </Button>
                    <Button
                      onClick={() => {
                        setGenerationData({
                          prompt: "",
                          images: [],
                          isGenerating: false
                        })
                      }}
                      variant="outline"
                      className="flex-1 border-white/30 text-white hover:bg-white/10"
                    >
                      生成新视频
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

            {/* 右侧：视频展示区域 */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-white text-center">
                  生成预览
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generationData.result ? (
                  /* 显示生成的视频 */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={generationData.result.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        poster="/api/placeholder/640/360"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white/80 text-sm mb-3">
                        生成完成！点击播放查看您的作品
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            const a = document.createElement('a')
                            a.href = generationData.result!.videoUrl
                            a.download = `veo-ai-${generationData.result!.id}.mp4`
                            a.click()
                          }}
                          className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </Button>
                        <Button
                          onClick={() => {
                            setGenerationData({
                              prompt: "",
                              images: [],
                              isGenerating: false
                            })
                          }}
                          variant="outline"
                          className="flex-1 border-white/30 text-white hover:bg-white/10"
                          size="sm"
                        >
                          重新生成
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ) : generationData.isGenerating ? (
                  /* 显示生成中状态 */
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="aspect-video bg-black/20 rounded-lg flex flex-col items-center justify-center space-y-4"
                  >
                    <motion.div
                      className="w-16 h-16 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">AI正在创作中...</p>
                      <p className="text-white/60 text-sm">预计需要30-60秒</p>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 45, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                ) : (
                  /* 默认展示状态 */
                  <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-white/20">
                    <motion.div
                      className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-500/20 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Film className="w-10 h-10 text-yellow-400" />
                    </motion.div>
                    <div className="text-center">
                      <p className="text-white font-medium mb-2">您的视频将在这里显示</p>
                      <p className="text-white/60 text-sm max-w-xs">
                        输入描述并点击生成，AI将为您创作专业视频
                      </p>
                    </div>
                    
                    {/* 示例视频缩略图 */}
                    <div className="mt-6 space-y-3">
                      <p className="text-white/50 text-xs text-center">生成示例</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-16 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded border border-white/10 flex items-center justify-center"
                          >
                            <Play className="w-4 h-4 text-white/40" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative container mx-auto px-4 py-20">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-6 text-white">
            为什么选择 <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">VEO AI</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            体验前所未有的AI视频生成能力，让创意无限可能
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: "闪电般速度",
              desc: "3-5分钟生成",
              content: "基于最新VEO 3.1模型，提供业界领先的生成速度，让您的创意即刻成真",
              gradient: "from-yellow-400 to-orange-500",
              delay: 0
            },
            {
              icon: Film,
              title: "电影级品质",
              desc: "支持4K分辨率",
              content: "从720p到4K，多种分辨率选择，每一帧都是艺术品级的视觉享受",
              gradient: "from-purple-500 to-pink-500",
              delay: 0.2
            },
            {
              icon: Sparkles,
              title: "智能积分制",
              desc: "灵活按需使用",
              content: "预付费积分模式，用多少花多少，多种套餐选择满足不同需求",
              gradient: "from-blue-500 to-cyan-500",
              delay: 0.4
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="group relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: feature.delay }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
            >
              <Card className="relative overflow-hidden bg-white/10 backdrop-blur-sm border-white/20 text-white h-full group-hover:bg-white/20 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <motion.div
                    className={`mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 10 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-white/60 font-medium">
                    {feature.desc}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-white/80 leading-relaxed">
                    {feature.content}
                  </p>
                </CardContent>
                
                {/* 悬停效果 */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-5`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold text-white mb-4">
              数据说话，实力证明
            </h3>
            <p className="text-white/70 text-lg">
              全球创作者的共同选择
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: 25000, suffix: "+", label: "视频已生成", icon: Film },
              { value: 12000, suffix: "+", label: "满意用户", icon: CheckCircle },
              { value: 99.9, suffix: "%", label: "正常运行时间", icon: Zap },
              { value: 3, suffix: "分钟", label: "平均生成时间", icon: Sparkles }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                  <motion.div
                    className={`mx-auto mb-4 w-12 h-12 rounded-full bg-gradient-to-r ${
                      index % 2 === 0 ? 'from-yellow-400 to-orange-500' : 'from-purple-500 to-pink-500'
                    } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div className="text-4xl font-bold text-white mb-2">
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix}
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"
                    />
                  </div>
                  <div className="text-white/70 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative container mx-auto px-4 py-20">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              常见问题
            </h2>
            <p className="text-white/70 text-lg">
              您想了解的一切都在这里
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "VEO AI 如何工作？",
                a: "VEO AI 使用先进的AI模型将您的文字描述和参考图片转化为高质量视频。只需输入描述，可选上传参考图片，AI将在30-60秒内生成视频，每次消耗15积分。"
              },
              {
                q: "可以上传什么类型的图片？",
                a: "支持JPG、PNG、WebP格式的图片，每张最大5MB。您可以上传照片、艺术作品、草图等任何视觉内容。AI最多可处理6张参考图片，以更好地理解您的创意。"
              },
              {
                q: "积分如何收费？",
                a: "每次生成视频消耗15积分。新用户注册即送10积分。您可以通过灵活的套餐购买更多积分：基础套餐¥49/50积分，专业套餐¥99/150积分，企业套餐¥299/500积分。"
              },
              {
                q: "如果对生成的视频不满意怎么办？",
                a: "如果生成失败（技术问题），积分会自动退还。您可以尝试修改描述或使用不同的参考图片重新生成。为获得最佳效果，建议使用清晰、具体的描述。"
              },
              {
                q: "我的数据安全吗？",
                a: "绝对安全！所有上传内容都经过加密存储，我们绝不会将您的内容用于AI模型训练或与第三方分享。您可以随时删除您的数据，我们完全符合隐私法规要求。"
              },
              {
                q: "生成的视频可以商用吗？",
                a: "可以！所有通过VEO AI生成的视频完全归您所有，可用于任何商业用途，无需额外授权费用。但请确保您的描述和参考图片不侵犯他人版权。"
              }
            ].map((faq, index) => (
              <motion.details
                key={index}
                className="group bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:bg-white/15 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <summary className="px-6 py-4 cursor-pointer list-none flex items-center justify-between text-white font-medium text-lg">
                  <span className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center mr-3 text-yellow-400 font-bold">
                      {index + 1}
                    </span>
                    {faq.q}
                  </span>
                  <span className="text-yellow-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-white/80 leading-relaxed">
                  {faq.a}
                </div>
              </motion.details>
            ))}
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-white/60 text-sm">
              还有其他问题？ 
              <a href="/profile" className="text-yellow-400 hover:text-yellow-300 ml-1 underline">
                访问个人中心
              </a>
              {" "}或查看完整文档
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="relative container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-white">
              免费试用，立即体验
            </span>
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight">
            准备好释放您的
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              创作潜能
            </span>
            了吗？
          </h2>
          
          <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            加入全球创作者的行列，用VEO AI将您的想象力转化为惊艳的视频内容
          </p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <button
              className="btn-primary-fixed btn-gradient-yellow inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-bold px-12 py-6 text-xl group shadow-xl border-0 transition-all hover:shadow-2xl h-auto"
            >
              <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
              免费开始创作
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-purple-900 hover:bg-white/90 border-2 border-white px-12 py-6 text-xl font-bold shadow-xl transition-all"
            >
              查看定价方案
            </Button>
          </motion.div>
          
          <motion.p
            className="text-sm text-white/50 mt-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            无需信用卡 · 即刻开始 · 随时升级
          </motion.p>
        </motion.div>
        
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`cta-decoration-${i}`}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + Math.sin(i) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/40 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            className="flex flex-col md:flex-row items-center justify-between"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-xl">V</span>
              </div>
              <div>
                <div className="text-white font-bold text-xl">VEO AI</div>
                <div className="text-white/50 text-sm">视频创作平台</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-8 text-white/70">
              <Link href="/privacy" className="hover:text-white transition-colors">隐私政策</Link>
              <Link href="/terms" className="hover:text-white transition-colors">服务条款</Link>
              <a href="#" className="hover:text-white transition-colors">帮助中心</a>
              <Link href="/contact" className="hover:text-white transition-colors">联系我们</Link>
            </div>
          </motion.div>
          
          <motion.div
            className="mt-8 pt-8 border-t border-white/10 text-center text-white/50"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="space-y-2">
              <p>&copy; 2025 VEO AI视频平台. 保留所有权利. | 基于最新VEO 3.1模型技术</p>
              <p>
                <a 
                  href="https://beian.miit.gov.cn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  蜀ICP备2025135924号
                </a>
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  )
}