"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { VideoInput } from "@/components/generate/video-input"
import { ThreeDLoader } from "@/components/ui/3d-loader"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Sparkles, LogIn, UserPlus, Download, Play, Zap, AlertTriangle, CreditCard } from "lucide-react"
import { useCreditMonitor } from "@/hooks/use-credit-monitor"
import { CreditLowModal } from "@/components/ui/credit-low-modal"

interface GenerationData {
  prompt: string
  images: File[]
  model: string
  duration: number
  aspectRatio: string
  remixTargetId: string
  isGenerating: boolean
  result?: {
    videoUrl: string
    id: string
    createdAt: string
  }
}

// 将使用 useSearchParams 的逻辑提取到单独的组件
function GeneratePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [generationData, setGenerationData] = useState<GenerationData>({
    prompt: "",
    images: [],
    model: "sora2",  // 默认选择SORA2
    duration: 10,
    aspectRatio: "9:16",
    remixTargetId: "",
    isGenerating: false
  })
  const [generationProgress, setGenerationProgress] = useState(0)
  const [remixVideoInfo, setRemixVideoInfo] = useState<{prompt: string, videoId: string} | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout>()
  
  // 积分监控
  const {
    credits,
    loading: creditsLoading,
    showLowCreditModal,
    setShowLowCreditModal,
    refreshCredits,
    isLowCredit
  } = useCreditMonitor()

  // 处理续作功能：从URL参数获取remixFrom
  useEffect(() => {
    const remixFrom = searchParams.get('remixFrom')
    if (remixFrom && session) {
      // 获取视频信息
      fetch(`/api/videos/${remixFrom}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.video) {
            const video = data.video
            // 自动设置模型为sora2
            setGenerationData(prev => ({
              ...prev,
              model: 'sora2',
              remixTargetId: video.remixPid || ''
            }))
            // 保存视频信息用于显示提示
            setRemixVideoInfo({
              prompt: video.prompt,
              videoId: video.id
            })
          }
        })
        .catch(err => {
          console.error('获取续作视频信息失败:', err)
          alert('获取续作视频信息失败，请重试')
        })
    }
  }, [searchParams, session])

  const handleGenerate = async () => {
    if (!generationData.prompt.trim()) return
    
    setGenerationData(prev => ({ ...prev, isGenerating: true }))
    setGenerationProgress(0)
    
    // 模拟进度（实际是基于时间估算）
    progressIntervalRef.current = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) return prev // 在95%停止，等待实际完成
        return prev + Math.random() * 5
      })
    }, 2000)
    
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
          images: uploadedImages,
          model: generationData.model,
          duration: generationData.duration,
          aspectRatio: generationData.aspectRatio,
          remixTargetId: generationData.remixTargetId
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "生成失败")
      }
      
      // 生成成功后刷新积分
      refreshCredits()

      // 轮询检查生成状态
      const taskId = data.taskId || data.data?.taskId
      const videoId = data.videoId
      let pollCount = 0
      const maxPollCount = 180 // 最多轮询180次（9分钟）
      
      console.log('🎬 开始轮询视频状态', { taskId, videoId })
      
      const pollStatus = async (): Promise<void> => {
        try {
          pollCount++
          
          const statusResponse = await fetch(`/api/generate/video?taskId=${taskId}`)
          const statusData = await statusResponse.json()

          // 处理大写状态（匹配数据库枚举）
          const status = statusData.status?.toUpperCase()

          console.log(`📊 轮询第${pollCount}次:`, { 
            status, 
            hasVideoUrl: !!statusData.videoUrl,
            videoUrlPreview: statusData.videoUrl ? statusData.videoUrl.substring(0, 50) + '...' : null
          })

          if (status === "COMPLETED" && statusData.videoUrl) {
            // 视频生成完成
            console.log('✅ 视频生成完成！', { videoUrl: statusData.videoUrl })
            
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
            }
            setGenerationProgress(100)
            
            // 立即显示视频
            setTimeout(() => {
              setGenerationData(prev => ({
                ...prev,
                isGenerating: false,
                result: {
                  videoUrl: statusData.videoUrl,
                  id: taskId,
                  createdAt: statusData.createdAt || new Date().toISOString()
                }
              }))
              
              // 显示成功提示
              console.log('🎉 视频已显示在右侧')
              alert('🎉 视频生成成功！您可以在右侧预览或前往我的视频查看。')
            }, 500)
          } else if (status === "FAILED") {
            console.error('❌ 视频生成失败', { error: statusData.error })
            throw new Error(statusData.error || "视频生成失败")
          } else if (pollCount >= maxPollCount) {
            // 超时，但不报错，让用户去我的视频查看
            console.warn('⏰ 轮询超时，视频可能还在生成中')
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current)
            }
            setGenerationData(prev => ({ ...prev, isGenerating: false }))
            alert('视频生成时间较长，请稍后在"我的视频"页面查看。')
          } else {
            // PROCESSING 或 PENDING 状态，继续轮询
            // 前20次每2秒轮询，之后每3秒轮询
            const interval = pollCount < 20 ? 2000 : 3000
            console.log(`⏳ 继续轮询... (${interval/1000}秒后)`)
            setTimeout(pollStatus, interval)
          }
        } catch (error) {
          console.error('❌ 轮询错误:', error)
          throw error
        }
      }

      // 立即开始第一次轮询
      console.log('⏱️  2秒后开始第一次轮询...')
      setTimeout(pollStatus, 2000)

    } catch (error) {
      console.error("生成失败:", error)
      
      // 清除进度定时器
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      
      let errorMessage = "生成失败，请稍后重试"
      if (error instanceof Error) {
        errorMessage = error.message
        
        // 特殊错误处理
        if (error.message.includes("余额不足") || error.message.includes("服务暂时不可用")) {
          errorMessage = "⚠️ 服务暂时不可用，请稍后重试或联系我们。"
        } else if (error.message.includes("积分不足")) {
          errorMessage = "💳 积分不足，请充值"
        } else if (error.message.includes("过期")) {
          errorMessage = "⏰ 套餐已过期，请续费后继续使用"
        }
      }
      
      alert(errorMessage)
      setGenerationData(prev => ({ ...prev, isGenerating: false }))
      setGenerationProgress(0)
    }
  }
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
    }
  }
  }, [])

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
      
      {/* 积分不足弹窗 */}
      <CreditLowModal
        credits={credits}
        isOpen={showLowCreditModal}
        onClose={() => setShowLowCreditModal(false)}
      />
      
      {/* 积分显示条 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-yellow-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isLowCredit ? 'text-red-500' : 'text-yellow-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  剩余积分：
                </span>
                <span className={`text-lg font-bold ${isLowCredit ? 'text-red-600' : 'text-gray-900'}`}>
                  {creditsLoading ? '...' : credits}
                </span>
              </div>
              
              {isLowCredit && (
                <motion.div
                  className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-400/30 rounded-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    积分不足
                  </span>
                </motion.div>
              )}
            </div>
            
            <Button
              onClick={() => router.push('/pricing')}
              size="sm"
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              快速充值
            </Button>
          </div>
        </div>
      </div>
      
      {/* 积分警告横幅 */}
      {isLowCredit && (
        <motion.div
          className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-b-2 border-red-400/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">积分即将用完</h3>
                  <p className="text-sm text-gray-600">
                    充值后可继续创作，首次充值额外赠送50%积分
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/pricing')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                立即充值
              </Button>
            </div>
          </div>
        </motion.div>
      )}
      
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
          {/* 续作提示 */}
          {remixVideoInfo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-400/30 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">🎬 续作模式</h3>
                  <p className="text-sm text-gray-600">
                    正在基于视频「{remixVideoInfo.prompt.substring(0, 50)}...」进行续作创作
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
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
                model={generationData.model}
                duration={generationData.duration}
                aspectRatio={generationData.aspectRatio}
                remixTargetId={generationData.remixTargetId}
                isGenerating={generationData.isGenerating}
                onPromptChange={(prompt) => setGenerationData(prev => ({ ...prev, prompt }))}
                onImagesChange={(images) => setGenerationData(prev => ({ ...prev, images }))}
                onModelChange={(model) => setGenerationData(prev => ({ ...prev, model }))}
                onDurationChange={(duration) => setGenerationData(prev => ({ ...prev, duration }))}
                onAspectRatioChange={(aspectRatio) => setGenerationData(prev => ({ ...prev, aspectRatio }))}
                onRemixTargetIdChange={(remixTargetId) => setGenerationData(prev => ({ ...prev, remixTargetId }))}
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
                  // 生成中状态 - 3D 加载动画
                  <ThreeDLoader 
                    progress={generationProgress} 
                    message="AI 正在创作中..."
                    type="dna"
                  />
                ) : generationData.result ? (
                  // 完成状态
                  <div className="space-y-6">
                    <div className="relative bg-black rounded-xl overflow-hidden">
                      <video
                        src={generationData.result.videoUrl}
                        controls
                        autoPlay
                        className="w-full h-auto"
                        poster="/placeholder-video.jpg"
                        crossOrigin="anonymous"
                        playsInline
                        onError={(e) => {
                          console.error('视频加载失败:', generationData.result?.videoUrl, e);
                        }}
                        onLoadedData={() => {
                          console.log('视频加载成功:', generationData.result?.videoUrl);
                        }}
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
                            model: "sora2",
                            duration: 10,
                            aspectRatio: "9:16",
                            remixTargetId: "",
                            isGenerating: false
                          })
                          setRemixVideoInfo(null)
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

// 主组件用 Suspense 包裹
export default function GeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
        <AnimatedBackground />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">正在加载...</p>
          </div>
        </div>
      </div>
    }>
      <GeneratePageContent />
    </Suspense>
  )
}
