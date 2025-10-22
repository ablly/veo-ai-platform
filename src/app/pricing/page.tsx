"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Crown, Award, Zap, CreditCard, Gift } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface CreditPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  originalPrice: number
  features: string[]
  isPopular: boolean
  isActive: boolean
}

export default function PricingPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/credits/packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.packages.filter((pkg: CreditPackage) => pkg.isActive && pkg.price > 0))
      }
    } catch (error) {
      console.error('获取套餐失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (packageId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })

      const data = await response.json()
      if (data.success) {
        alert('购买成功！积分已到账')
        // 可以跳转到积分页面或刷新当前页面
        router.push('/credits')
      } else {
        alert(data.error || '购买失败')
      }
    } catch (error) {
      console.error('购买失败:', error)
      alert('购买失败，请稍后重试')
    }
  }

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-400 to-purple-500",
      "from-green-400 to-blue-500", 
      "from-purple-400 to-pink-500",
      "from-orange-400 to-red-500"
    ]
    return gradients[index % gradients.length]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white/80 text-sm">灵活的积分套餐</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            选择适合您的
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> 创作套餐</span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            从个人创作者到企业用户，我们为每个创作需求提供完美的解决方案。
            <br />使用VEO AI，让您的创意无限可能。
          </p>

          {/* New User Bonus Banner */}
          <div className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm font-medium">
              新用户注册即送10积分，立即体验AI视频生成
            </span>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => {
            const gradient = getGradientClass(index)
            
            return (
              <motion.div
                key={pkg.id}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -10 }}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center">
                      <Crown className="w-4 h-4 mr-1" />
                      最受欢迎
                    </div>
                  </div>
                )}
                
                <Card className={`h-full bg-white/10 backdrop-blur-sm border-white/20 text-white relative overflow-hidden ${pkg.isPopular ? 'ring-2 ring-yellow-400/50 scale-105' : ''}`}>
                  <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-5`} />
                  
                  <CardHeader className="text-center relative">
                    <CardTitle className="text-2xl font-bold mb-2">{pkg.name}</CardTitle>
                    <CardDescription className="text-white/60 mb-4">
                      {pkg.description}
                    </CardDescription>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        {pkg.originalPrice > pkg.price && (
                          <span className="text-white/40 line-through text-lg">
                            ¥{pkg.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl font-bold">¥{pkg.price}</span>
                      </div>
                      <p className="text-white/50 text-sm">一次性付费</p>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">{pkg.credits} 积分</span>
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature: string, i: number) => (
                        <li key={i} className="flex items-center text-white/80">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      onClick={() => handlePurchase(pkg.id)}
                      className={`w-full ${pkg.isPopular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}
                      size="lg"
                    >
                      {pkg.isPopular ? (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          立即购买
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          立即购买
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Features Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-white mb-12">为什么选择VEO AI？</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: "真实物理运动",
                description: "基于物理引擎的真实运动模拟，让视频更加自然流畅"
              },
              {
                icon: Star,
                title: "高级镜头控制",
                description: "专业级镜头运动控制，实现电影级视觉效果"
              },
              {
                icon: Award,
                title: "极速生成",
                description: "先进的AI算法，快速生成高质量视频内容"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">常见问题</h2>
          
          <div className="space-y-6">
            {[
              {
                question: "积分有有效期吗？",
                answer: "积分购买后30天内有效，请及时使用。"
              },
              {
                question: "可以退款吗？",
                answer: "支持7天内无理由退款，未使用的积分可全额退还。"
              },
              {
                question: "生成的视频有版权吗？",
                answer: "您拥有生成视频的完整版权，可用于商业用途。"
              },
              {
                question: "支持哪些支付方式？",
                answer: "支持支付宝、微信支付、银联等多种支付方式。"
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
              >
                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-white/70">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}


