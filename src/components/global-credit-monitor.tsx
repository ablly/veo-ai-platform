"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, X, Zap, TrendingUp } from "lucide-react"

export function GlobalCreditMonitor() {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLowCreditAlert, setShowLowCreditAlert] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // 获取积分
  useEffect(() => {
    const fetchCredits = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/credits/balance")
        if (response.ok) {
          const data = await response.json()
          const availableCredits = data.credits.available
          setCredits(availableCredits)
          
          // 如果积分低于3，显示提醒
          if (availableCredits < 3 && !dismissed) {
            setShowLowCreditAlert(true)
          }
        }
      } catch (error) {
        console.error("获取积分失败:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
    
    // 每30秒刷新一次积分
    const interval = setInterval(fetchCredits, 30000)
    return () => clearInterval(interval)
  }, [session, dismissed])

  // 不在登录、注册、充值页面显示
  const hideOnPages = ['/login', '/register', '/pricing', '/credits']
  if (hideOnPages.some(page => pathname?.startsWith(page))) {
    return null
  }

  // 未登录不显示
  if (!session) {
    return null
  }

  return (
    <>
      {/* 顶部积分显示条 */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-900/95 to-pink-900/95 backdrop-blur-md border-b border-white/10 shadow-lg"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <motion.div
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-white/80 text-sm">我的积分:</span>
                {loading ? (
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className={`font-bold text-lg ${
                    credits !== null && credits < 3 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {credits !== null ? credits : '--'}
                  </span>
                )}
              </div>
              
              {credits !== null && credits < 3 && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>积分不足</span>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/pricing')}
              className="px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-sm rounded-full transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>立即充值</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* 积分不足弹窗提醒 */}
      <AnimatePresence>
        {showLowCreditAlert && !dismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowLowCreditAlert(false)
              setDismissed(true)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 overflow-hidden"
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => {
                  setShowLowCreditAlert(false)
                  setDismissed(true)
                }}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* 内容 */}
              <div className="p-8 text-center">
                {/* 图标 */}
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <AlertCircle className="w-10 h-10 text-white" />
                </motion.div>

                {/* 标题 */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  积分余额不足
                </h3>

                {/* 描述 */}
                <p className="text-white/80 mb-2">
                  您当前剩余 <span className="text-red-400 font-bold text-xl">{credits}</span> 积分
                </p>
                <p className="text-white/60 text-sm mb-6">
                  请充值后继续创作
                </p>

                {/* 优惠提示 */}
                <div className="bg-yellow-400/20 border border-yellow-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">首单特惠</span>
                  </div>
                  <p className="text-white/90 text-sm">
                    首次充值额外赠送 <span className="text-yellow-400 font-bold">50%</span> 积分
                  </p>
                  <p className="text-white/70 text-xs mt-1">
                    例如：购买50积分，实得75积分
                  </p>
                </div>

                {/* 按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowLowCreditAlert(false)
                      setDismissed(true)
                    }}
                    className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-all"
                  >
                    稍后充值
                  </button>
                  <button
                    onClick={() => {
                      setShowLowCreditAlert(false)
                      router.push('/pricing')
                    }}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-5 h-5" />
                    <span>立即充值</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
