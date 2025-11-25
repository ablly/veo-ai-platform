"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Crown, Award, Zap, CreditCard, Gift, Globe, X, AlertCircle, Smartphone } from "lucide-react"
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
  const [region, setRegion] = useState<'CN' | 'INTL'>('CN')
  const [manualRegion, setManualRegion] = useState<'CN' | 'INTL' | null>(null)
  const [showCanceledAlert, setShowCanceledAlert] = useState(false)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  // 获取套餐数据
  useEffect(() => {
    fetchPackages()
  }, [])

  // 检查是否首次访问（显示地区选择弹窗）
  useEffect(() => {
    // 确保在客户端环境中执行
    if (typeof window === 'undefined') return

    const hasSelectedRegion = localStorage.getItem('region_selected')
    const cookieRegion = document.cookie.split('; ').find(row => row.startsWith('user_region='))
    
    console.log('🔍 检查地区选择状态:', { hasSelectedRegion, cookieRegion })
    
    if (!hasSelectedRegion && !cookieRegion) {
      console.log('✅ 首次访问，将显示地区选择弹窗')
      // 延迟800ms显示弹窗，让页面先加载
      const timer = setTimeout(() => {
        setShowRegionModal(true)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      console.log('ℹ️ 已有地区选择记录，不显示弹窗')
    }
  }, [])

  // 检查是否有 canceled 参数
  useEffect(() => {
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
        console.log('🛒 创建支付宝订单...', { packageId: pkg.id, packageName: pkg.name })
        
        const response = await fetch('/api/payment/alipay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        })

        console.log('📡 支付宝接口响应状态:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ 支付宝接口错误:', errorText)
          alert(`创建订单失败 (${response.status}): ${errorText}`)
          return
        }

        const data = await response.json()
        console.log('📦 支付宝接口响应:', data)
        
        if (data.success && data.paymentUrl) {
          console.log('✅ 跳转到支付宝支付页面')
          window.location.href = data.paymentUrl
        } else {
          console.error('❌ 创建订单失败:', data.message)
          alert(data.message || '创建订单失败，请稍后重试')
        }
      } else {
        // 使用Stripe
        if (!pkg.stripePriceId) {
          alert('该套餐暂不支持国际支付')
          return
        }

        console.log('🛒 创建Stripe订单...', { packageId: pkg.id, packageName: pkg.name })

        const response = await fetch('/api/payment/stripe/create-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId: pkg.id })
        })

        console.log('📡 Stripe接口响应状态:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ Stripe接口错误:', errorText)
          alert(`Failed to create checkout (${response.status}): ${errorText}`)
          return
        }

        const data = await response.json()
        console.log('📦 Stripe接口响应:', data)
        
        if (data.success && data.url) {
          console.log('✅ 跳转到Stripe支付页面')
          window.location.href = data.url
        } else {
          console.error('❌ 创建订单失败:', data.message)
          alert(data.message || 'Failed to create checkout session')
        }
      }
    } catch (error) {
      console.error('❌ 购买失败:', error)
      alert(currentRegion === 'CN' 
        ? `购买失败: ${error instanceof Error ? error.message : '未知错误'}` 
        : `Purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const toggleRegion = () => {
    const newRegion = currentRegion === 'CN' ? 'INTL' : 'CN'
    setManualRegion(newRegion)
    document.cookie = `user_region=${newRegion}; path=/; max-age=86400`
  }

  const selectRegion = (selectedRegion: 'CN' | 'INTL') => {
    setManualRegion(selectedRegion)
    document.cookie = `user_region=${selectedRegion}; path=/; max-age=86400`
    localStorage.setItem('region_selected', 'true')
    setShowRegionModal(false)
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
      {/* 地区选择弹窗 */}
      <AnimatePresence>
        {showRegionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              // 如果用户点击背景关闭，默认选择CN
              selectRegion('CN')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Globe className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">选择您的支付方式</h2>
                <p className="text-white/70">Choose Your Payment Method</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 国内支付 - 支付宝 */}
                <motion.button
                  onClick={() => selectRegion('CN')}
                  className="group relative p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-2 border-blue-400/50 hover:border-blue-400 rounded-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      推荐
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mb-4">
                      <Smartphone className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">国内支付</h3>
                    <p className="text-blue-300 font-medium mb-3">支付宝 Alipay</p>
                    <ul className="text-white/80 text-sm space-y-2">
                      <li>✓ 支持支付宝扫码支付</li>
                      <li>✓ 人民币结算</li>
                      <li>✓ 即时到账</li>
                    </ul>
                  </div>
                </motion.button>

                {/* 海外支付 - Stripe */}
                <motion.button
                  onClick={() => selectRegion('INTL')}
                  className="group relative p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-2 border-purple-400/50 hover:border-purple-400 rounded-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">International</h3>
                    <p className="text-purple-300 font-medium mb-3">Stripe Payment</p>
                    <ul className="text-white/80 text-sm space-y-2">
                      <li>✓ Credit/Debit Cards</li>
                      <li>✓ USD Currency</li>
                      <li>✓ Secure Payment</li>
                    </ul>
                  </div>
                </motion.button>
              </div>

              <p className="text-center text-white/50 text-sm mt-6">
                您可以随时在页面上切换支付方式
                <br />
                You can switch payment methods anytime
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

          {/* 大型支付方式指示器 - 更醒目 */}
          <motion.div 
            className="mt-8 flex justify-center"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl border-2 shadow-2xl ${
              currentRegion === 'CN'
                ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/60'
                : 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/60'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                currentRegion === 'CN'
                  ? 'bg-gradient-to-r from-blue-400 to-cyan-400'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400'
              }`}>
                {currentRegion === 'CN' ? (
                  <Smartphone className="w-6 h-6 text-white" />
                ) : (
                  <CreditCard className="w-6 h-6 text-white" />
                )}
              </div>
              <div className="text-left">
                <div className={`text-lg font-bold ${
                  currentRegion === 'CN' ? 'text-blue-200' : 'text-purple-200'
                }`}>
                  {currentRegion === 'CN' ? '当前支付方式' : 'Current Payment'}
                </div>
                <div className="text-white text-xl font-bold">
                  {currentRegion === 'CN' ? '支付宝 Alipay' : 'Stripe (Card)'}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 优化后的地区切换按钮 */}
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            {/* 首单特惠宣传 */}
            <motion.div
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/50 rounded-full shadow-lg"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 30px rgba(251, 191, 36, 0.5)",
                  "0 0 20px rgba(251, 191, 36, 0.3)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-bold">
                {currentRegion === 'CN' 
                  ? '🎁 首单特惠：首次充值额外赠送50%积分！'
                  : '🎁 First Purchase Bonus: Get 50% Extra Credits!'
                }
              </span>
            </motion.div>
            
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full">
              <Gift className="w-5 h-5 text-green-400" />
              <span className="text-green-300 text-sm font-medium">
                {currentRegion === 'CN' 
                  ? '新用户注册即送10积分'
                  : 'New users get 10 free credits'
                }
              </span>
            </div>
            
            <motion.button
              onClick={toggleRegion}
              className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 transition-all group shadow-lg ${
                currentRegion === 'CN'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border-purple-400/50 hover:border-purple-400'
                  : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/30 hover:to-cyan-500/30 border-blue-400/50 hover:border-blue-400'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentRegion === 'CN'
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                  : 'bg-gradient-to-r from-blue-400 to-cyan-400'
              }`}>
                {currentRegion === 'CN' ? (
                  <CreditCard className="w-5 h-5 text-white" />
                ) : (
                  <Smartphone className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-white text-base font-bold">
                  {currentRegion === 'CN' ? '切换到国际支付' : 'Switch to Alipay'}
                </span>
                <span className={`text-sm font-medium ${
                  currentRegion === 'CN' ? 'text-purple-300' : 'text-blue-300'
                }`}>
                  {currentRegion === 'CN' ? 'Stripe (Credit Card)' : '支付宝 (推荐国内用户)'}
                </span>
              </div>
              <Globe className="w-5 h-5 text-white group-hover:rotate-180 transition-transform duration-500" />
            </motion.button>
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
                    
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-300 font-medium">
                          {pkg.credits} {currentRegion === 'CN' ? '积分' : 'Credits'}
                        </span>
                      </div>
                      
                      {/* 首单特惠提示 */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-400/20 to-blue-400/20 border border-green-400/30 rounded-lg">
                        <Gift className="w-3 h-3 text-green-400" />
                        <span className="text-green-300 text-xs font-medium">
                          {currentRegion === 'CN' 
                            ? `首单送${Math.floor(pkg.credits * 0.5)}积分` 
                            : `+${Math.floor(pkg.credits * 0.5)} Bonus`
                          }
                        </span>
                      </div>
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
                          {currentRegion === 'CN' ? (
                            <Smartphone className="w-4 h-4 mr-2" />
                          ) : (
                            <CreditCard className="w-4 h-4 mr-2" />
                          )}
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
