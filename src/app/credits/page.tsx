"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { 
  CreditCard, 
  Zap, 
  Crown, 
  Star, 
  Gift,
  History,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  Award
} from "lucide-react"
import { useEffect, useState } from "react"

interface CreditStats {
  available: number
  used: number
  total: number
  frozen: number
  expiresAt: string | null
}

interface CreditPackage {
  id: string
  name: string
  description: string | null
  credits: number
  price: number
  originalPrice: number
  features: any
  isPopular: boolean
  isActive: boolean
}

interface Transaction {
  id: string
  type: string
  amount: number
  description: string
  created_at: string
  balance_before: number
  balance_after: number
}

export default function CreditsPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null)
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (session) {
      fetchCreditsData()
    }
  }, [session])

  const fetchCreditsData = async () => {
    try {
      // 获取积分统计
      const statsResponse = await fetch('/api/user/credits/balance')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        if (statsData.success) {
          setCreditStats({
            available: statsData.credits.available,
            used: statsData.credits.used,
            total: statsData.credits.total,
            frozen: statsData.credits.frozen,
            expiresAt: null
          })
        }
      }

      // 获取积分套餐
      const packagesResponse = await fetch('/api/credits/packages')
      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json()
        if (packagesData.success) {
          setCreditPackages(packagesData.packages)
        }
      }

      // 获取交易历史
      const transactionsResponse = await fetch('/api/user/credits/transactions')
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json()
        if (transactionsData.success) {
          setTransactions(transactionsData.transactions)
        }
      }
    } catch (error) {
      console.error('获取积分数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!session) {
    redirect("/login")
  }

  // 获取渐变样式
  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-500 to-cyan-500",
      "from-purple-500 to-pink-500",
      "from-orange-500 to-red-500"
    ]
    return gradients[index % gradients.length]
  }

  // 处理购买积分
  const handlePurchase = async (packageId: string) => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          alert(`成功购买积分！订单号：${data.orderId}`)
          // 刷新积分数据
          fetchCreditsData()
        }
      } else {
        alert('购买失败，请稍后重试')
      }
    } catch (error) {
      console.error('购买失败:', error)
      alert('购买失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />

      <div className="relative container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            选择您的完美套餐
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            选择最适合您需求的套餐
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-green-300 text-sm font-medium">
              每个新用户都会获得免费积分，以便在购买付费套餐之前试用我们的服务
            </span>
          </div>
        </motion.div>

        {/* 当前积分状态 */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold">
                    <AnimatedCounter value={creditStats?.available || 0} />
                  </div>
                  <p className="text-white/60">可用积分</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold">
                    <AnimatedCounter value={creditStats?.used || 0} />
                  </div>
                  <p className="text-white/60">已使用积分</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold">
                    <AnimatedCounter value={creditStats?.total || 0} />
                  </div>
                  <p className="text-white/60">总计积分</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold">
                    <AnimatedCounter value={creditStats?.frozen || 0} />
                  </div>
                  <p className="text-white/60">冻结积分</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 积分套餐 */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">实惠的 AI 视频生成</h2>
            <p className="text-white/70">为你的创作需求选择完美的方案。通过透明的定价、灵活的积分和商业许可，生成惊艳的 AI 视频</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {creditPackages.length > 0 ? (
              creditPackages.filter(pkg => pkg.isActive && pkg.price > 0).map((pkg, index) => {
                const gradient = getGradientClass(index)
                const features = Array.isArray(pkg.features) ? pkg.features : 
                  (typeof pkg.features === 'string' ? JSON.parse(pkg.features) : [])
                
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
                          推荐选择
                        </div>
                      </div>
                    )}
                    
                    <Card className={`h-full bg-white/10 backdrop-blur-sm border-white/20 text-white relative overflow-hidden ${pkg.isPopular ? 'ring-2 ring-yellow-400/50' : ''}`}>
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
                            <span className="text-5xl font-bold">¥{pkg.price}</span>
                          </div>
                          <p className="text-white/50 text-sm">one-time payment</p>
                          <p className="text-white/40 text-xs mt-1">
                            实际价格: ¥{pkg.price} 一次性
                          </p>
                        </div>
                        
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 rounded-lg">
                          <Award className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-300 font-medium">{pkg.credits} 积分</span>
                        </div>
                      </CardHeader>

                      <CardContent className="relative">

                        <ul className="space-y-3 mb-6">
                          {features.map((feature: string, i: number) => (
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
                              开始使用
                            </>
                          ) : (
                            '开始使用'
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-3 text-center text-white/60 py-12">
                暂无可用的积分套餐
              </div>
            )}
          </div>
        </motion.div>

        {/* 积分使用历史 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <History className="w-6 h-6 mr-2" />
                使用记录
              </CardTitle>
              <CardDescription className="text-white/60">
                最近的积分消费和充值记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length > 0 ? (
                  transactions.map((record, index) => {
                    const typeMap: Record<string, { icon: any; color: string; label: string }> = {
                      'PURCHASE': { icon: Zap, color: 'green', label: '购买' },
                      'CONSUME': { icon: CreditCard, color: 'orange', label: '消耗' },
                      'BONUS': { icon: Gift, color: 'blue', label: '赠送' },
                      'REFUND': { icon: TrendingUp, color: 'yellow', label: '退款' },
                      'EXPIRE': { icon: Clock, color: 'red', label: '过期' }
                    }
                    const typeInfo = typeMap[record.type] || { icon: CreditCard, color: 'gray', label: record.type }
                    const Icon = typeInfo.icon
                    const isPositive = record.amount > 0
                    const timeAgo = new Date(record.created_at).toLocaleString('zh-CN')
                    
                    return (
                      <div 
                        key={record.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-${typeInfo.color}-500/20 text-${typeInfo.color}-400`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{record.description || `${typeInfo.label}积分`}</div>
                            <div className="text-white/50 text-sm">{timeAgo}</div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${isPositive ? "text-green-400" : "text-orange-400"}`}>
                            {isPositive ? "+" : ""}{record.amount} 积分
                          </div>
                          <div className="text-white/50 text-sm">
                            余额: {record.balance_after}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center text-white/60 py-12">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p>暂无积分使用记录</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}



