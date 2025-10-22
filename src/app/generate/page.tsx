"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { VideoInput } from "@/components/generate/video-input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, LogIn, UserPlus, Download, Play, Loader2 } from "lucide-react"

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

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generationData, setGenerationData] = useState<GenerationData>({
    prompt: "",
    images: [],
    isGenerating: false
  })

  const handleGenerate = async () => {
    if (!generationData.prompt.trim()) return
    
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
          uploadedImages.push(uploadData.url)
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
        throw new Error(data.error || "生成失败")
      }

      // 轮询检查生成状态
      const taskId = data.taskId
      const pollStatus = async (): Promise<void> => {
        const statusResponse = await fetch(`/api/generate/video?taskId=${taskId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === "completed" && statusData.videoUrl) {
          setGenerationData(prev => ({
            ...prev,
            isGenerating: false,
            result: {
              videoUrl: statusData.videoUrl,
              id: taskId,
              createdAt: statusData.createdAt
            }
          }))
        } else if (statusData.status === "failed") {
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
      alert(error instanceof Error ? error.message : "生成失败，请稍后重试")
      setGenerationData(prev => ({ ...prev, isGenerating: false }))
    }
  }

  // 如果正在加载认证状态，显示加载页面
  if (status === "loading") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在验证登录状态...</p>
          </div>
        </div>
      </div>
    )
  }

  // 如果用户未登录，显示登录提示页面
  if (!session) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <AnimatedBackground />
        
        <div className="flex items-center justify-center min-h-screen px-4">
          <motion.div
            className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center border border-yellow-200/50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              需要登录才能使用
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              VEO AI视频生成功能需要登录后才能使用。
              <br />
              登录后您将获得免费积分开始创作！
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                立即登录
              </Button>
              
              <Button
                onClick={() => router.push("/register")}
                variant="outline"
                className="w-full border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-bold py-3 px-6 rounded-xl"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                免费注册
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">
                <span className="font-bold">🎁 新用户福利：</span>
                注册即送 10 积分，立即开始创作！
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <AnimatedBackground />
      
      {/* Header Section */}
      <section className="relative container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-yellow-400/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                VEO 3.1 AI视频生成器
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              <span className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                AI视频创作
              </span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-700">让创意变为现实</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              用文字描述你的想象，AI 帮你创造出专业级视频内容
              <br />
              <span className="text-lg font-medium text-orange-600">支持文生视频和图+文生视频</span>
            </p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Input */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <VideoInput
                prompt={generationData.prompt}
                images={generationData.images}
                isGenerating={generationData.isGenerating}
                onPromptChange={(prompt) => setGenerationData(prev => ({ ...prev, prompt }))}
                onImagesChange={(images) => setGenerationData(prev => ({ ...prev, images }))}
                onGenerate={handleGenerate}
              />
            </motion.div>

            {/* Right Side - Result */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-yellow-200/50 p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  生成结果
                </h3>
                
                {!generationData.isGenerating && !generationData.result ? (
                  // 默认状态
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-24 h-24 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full flex items-center justify-center mb-6">
                      <Play className="w-12 h-12 text-yellow-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">
                      准备开始创作
                    </h4>
                    <p className="text-gray-500 max-w-sm">
                      输入您的创意描述，选择参考图片（可选），然后点击生成按钮开始创作您的专属视频
                    </p>
                  </div>
                ) : generationData.isGenerating ? (
                  // 生成中状态
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-20 animate-pulse"></div>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-700 mb-2">
                      AI正在创作中...
                    </h4>
                    <p className="text-gray-500 max-w-sm mb-4">
                      请耐心等待，通常需要1-3分钟
                    </p>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ) : generationData.result ? (
                  // 完成状态
                  <div className="space-y-6">
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      <video
                        src={generationData.result.videoUrl}
                        controls
                        className="w-full h-auto"
                        poster="/placeholder-video.jpg"
                      >
                        您的浏览器不支持视频播放。
                      </video>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = generationData.result!.videoUrl
                          link.download = `veo-video-${generationData.result!.id}.mp4`
                          document.body.appendChild(link)
                          link.click()
                          document.body.removeChild(link)
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-6 rounded-xl shadow-lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
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
                        className="flex-1 border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-50 font-bold py-3 px-6 rounded-xl"
                      >
                        重新生成
                      </Button>
                    </div>
                    
                    <div className="text-center text-sm text-gray-500">
                      生成时间：{new Date(generationData.result.createdAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
