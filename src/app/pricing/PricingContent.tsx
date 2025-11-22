"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Crown, Award, Zap, CreditCard, Gift, Globe, X, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

interface CreditPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  originalPrice: number
  usdPrice: number | null
  stripePriceId: string | null
  features: string[]
  isPopular: boolean
  isActive: boolean
  region: string
}

export default function PricingContent() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState<'CN' | 'INTL'>('INTL')
  const [manualRegion, setManualRegion] = useState<'CN' | 'INTL' | null>(null)
  const [showCanceledAlert, setShowCanceledAlert] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchPackages()
    
    // 检查是否有 canceled 参数
    const canceled = searchParams.get('canceled')
    if (canceled === 'true') {
      setShowCanceledAlert(true)
      // 5秒后自动隐藏提示
      const timer = setTimeout(() => {
        setShowCanceledAlert(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/credits/packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.packages.filter((pkg: CreditPackage) => pkg.isActive && pkg.price > 0))
        setRegion(data.region || 'INTL')
      }
    } catch (error) {
      console.error('获取套餐失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentRegion = manualRegion || region

  const handlePurchase = async (pkg: CreditPackage) => {
    if (!session) {
      router.push('/login')
      return
    }

    try {
      if (currentRegion === 'CN') {
        // 使用支付宝
        const response = await fetch('/api/payment/alipay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        })

        const data = await response.json()
        
        if (data.success && data.paymentUrl) {
          window.location.href = data.paymentUrl
        } else {
          alert(data.message || '创建订单失败，请稍后重试')
        }
      } else {
        // 使用Stripe
        if (!pkg.stripePriceId) {
          alert('该套餐暂不支持国际支付')
          return
        }

        const response = await fetch('/api/payment/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        })

        const data = await response.json()
        
        if (data.success && data.url) {
          window.location.href = data.url
        } else {
          alert(data.message || 'Failed to create checkout session')
        }
      }
    } catch (error) {
      console.error('购买失败:', error)
      alert(currentRegion === 'CN' ? '购买失败，请稍后重试' : 'Purchase failed, please try again')
    }
  }

  const toggleRegion = () => {
    const newRegion = currentRegion === 'CN' ? 'INTL' : 'CN'
    setManualRegion(newRegion)
    document.cookie = `user_region=${newRegion}; path=/; max-age=86400`
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

  const formatPrice = (pkg: CreditPackage) => {
    if (currentRegion === 'CN') {
      return `¥${pkg.price}`
    } else {
      return `$${pkg.usdPrice || 0}`
    }
  }

  const formatOriginalPrice = (pkg: CreditPackage) => {
    if (currentRegion === 'CN') {
      return `¥${pkg.originalPrice}`
    } else {
      const usdOriginal = pkg.usdPrice ? pkg.usdPrice * (pkg.originalPrice / pkg.price) : 0
      return `$${usdOriginal.toFixed(2)}`
    }
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
      {/* 取消支付提示 */}
      <AnimatePresence>
        {showCanceledAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm border border-orange-300/50 rounded-xl shadow-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">
                    {currentRegion === 'CN' ? '支付已取消' : 'Payment Canceled'}
                  </h3>
                  <p className="text-white/90 text-sm">
                    {currentRegion === 'CN' 
                      ? '您可以重新选择适合的套餐继续购买' 
                      : 'You can choose another package to continue'}
                  </p>
                </div>
                <button
                  onClick={() => setShowCanceledAlert(false)}
                  className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <span className="text-white/80 text-sm">
              {currentRegion === 'CN' ? '灵活的积分套餐' : 'Flexible Credit Packages'}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {currentRegion === 'CN' ? '选择适合您的' : 'Choose Your Perfect'}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {currentRegion === 'CN' ? ' 创作套餐' : ' Plan'}
            </span>
          </h1>
          
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            {currentRegion === 'CN' 
              ? '从个人创作者到企业用户，我们为每个创作需求提供完美的解决方案。使用VEO AI，让您的创意无限可能。'
              : 'From individual creators to enterprise users, we provide the perfect solution for every creative need. With VEO AI, make your creativity limitless.'
            }
          </p>

          {/* Current Payment Method Indicator */}
          <div className="mt-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
              <span className="text-blue-300 text-sm">
                {currentRegion === 'CN' 
                  ? '当前支付方式：支付宝 💳'
                  : 'Current Payment: Stripe (Credit Card) 💳'
                }
              </span>
            </div>
          </div>

          {/* Region Toggle Button */}
          <div className="mt-4 flex justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                {currentRegion === 'CN' 
                  ? '新用户注册即送10积分，立即体验AI视频生成'
                  : 'New users get 10 free credits to experience AI video generation'
                }
              </span>
            </div>
            
            <button
              onClick={toggleRegion}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all group"
            >
              <Globe className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-white text-sm font-medium">
                  {currentRegion === 'CN' ? '切换到国际支付 (Stripe)' : 'Switch to Alipay (支付宝)'}
                </span>
                <span className="text-white/60 text-xs">
                  {currentRegion === 'CN' ? 'Credit Card Payment' : '国内用户推荐'}
                </span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
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
                      {currentRegion === 'CN' ? '最受欢迎' : 'Most Popular'}
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
                            {formatOriginalPrice(pkg)}
                          </span>
                        )}
                        <span className="text-4xl font-bold">{formatPrice(pkg)}</span>
                      </div>
                      <p className="text-white/50 text-sm">
                        {currentRegion === 'CN' ? '一次性付费' : 'One-time payment'}
                      </p>
                    </div>
                    
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg">
                      <Award className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-300 font-medium">
                        {pkg.credits} {currentRegion === 'CN' ? '积分' : 'Credits'}
                      </span>
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
                      onClick={() => handlePurchase(pkg)}
                      className={`w-full ${pkg.isPopular ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}
                      size="lg"
                    >
                      {pkg.isPopular ? (
                        <>
                          <Star className="w-4 h-4 mr-2" />
                          {currentRegion === 'CN' ? '立即购买' : 'Buy Now'}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          {currentRegion === 'CN' ? '立即购买' : 'Buy Now'}
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
          <h2 className="text-3xl font-bold text-white mb-12">
            {currentRegion === 'CN' ? '为什么选择VEO AI？' : 'Why Choose VEO AI?'}
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Zap,
                title: currentRegion === 'CN' ? '真实物理运动' : 'Realistic Physics',
                description: currentRegion === 'CN' 
                  ? '基于物理引擎的真实运动模拟，让视频更加自然流畅'
                  : 'Physics-based motion simulation for natural and smooth videos'
              },
              {
                icon: Star,
                title: currentRegion === 'CN' ? '高级镜头控制' : 'Advanced Camera Control',
                description: currentRegion === 'CN'
                  ? '专业级镜头运动控制，实现电影级视觉效果'
                  : 'Professional camera motion control for cinematic visual effects'
              },
              {
                icon: Award,
                title: currentRegion === 'CN' ? '极速生成' : 'Lightning Fast',
                description: currentRegion === 'CN'
                  ? '先进的AI算法，快速生成高质量视频内容'
                  : 'Advanced AI algorithms for rapid high-quality video generation'
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
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            {currentRegion === 'CN' ? '常见问题' : 'Frequently Asked Questions'}
          </h2>
          
          <div className="space-y-6">
            {(currentRegion === 'CN' ? [
              {
                question: "积分有有效期吗？",
                answer: "积分有效期按照购买的积分套餐的规定时间计算，请及时使用。"
              },
              {
                question: "生成的视频有版权吗？",
                answer: "您拥有生成视频的完整版权，可用于商业用途。"
              },
              {
                question: "支持哪些支付方式？",
                answer: "国内用户支持支付宝支付，海外用户支持Stripe信用卡支付。"
              }
            ] : [
              {
                question: "Do credits expire?",
                answer: "Credits expire according to the package validity period. Please use them in time."
              },
              {
                question: "Do I own the generated videos?",
                answer: "Yes, you own full copyright of generated videos and can use them commercially."
              },
              {
                question: "What payment methods are supported?",
                answer: "We support Stripe for international payments (credit/debit cards) and Alipay for Chinese users."
              }
            ]).map((faq, index) => (
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
