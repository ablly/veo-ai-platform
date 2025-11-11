"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { motion } from "framer-motion"
import { Gift, CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function RedeemPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    credits?: number
    newBalance?: number
  } | null>(null)

  const handleRedeem = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        message: "请输入兑换码"
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/redemption-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() })
      })

      const data = await response.json()

      setResult({
        success: data.success,
        message: data.message,
        credits: data.credits,
        newBalance: data.newBalance
      })

      if (data.success) {
        setCode("")
        // 3秒后跳转到积分页面
        setTimeout(() => {
          router.push("/credits")
        }, 3000)
      }

    } catch (error) {
      console.error("兑换失败:", error)
      setResult({
        success: false,
        message: "兑换失败，请稍后重试"
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
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
    router.push("/login")
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />

      <div className="relative container mx-auto px-4 py-20">
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 标题 */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 10 }}
            >
              <Gift className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              兑换积分
            </h1>
            <p className="text-white/70 text-lg">
              输入兑换码，立即获取积分
            </p>
          </div>

          {/* 兑换表单 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <div className="space-y-6">
              {/* 输入框 */}
              <div>
                <label className="block text-white font-medium mb-3">
                  兑换码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VEO-XXXX-XXXX"
                  className="w-full px-4 py-3 border-2 border-white/20 rounded-xl bg-white/5 text-white placeholder-white/40 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all text-center text-xl font-mono tracking-wider"
                  maxLength={20}
                  disabled={loading}
                  onKeyPress={(e) => e.key === 'Enter' && handleRedeem()}
                />
                <p className="mt-2 text-white/50 text-sm text-center">
                  兑换码格式：VEO-XXXX-XXXX
                </p>
              </div>

              {/* 兑换按钮 */}
              <Button
                onClick={handleRedeem}
                disabled={loading || !code.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 text-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    兑换中...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5 mr-2" />
                    立即兑换
                  </>
                )}
              </Button>

              {/* 结果显示 */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl ${
                    result.success 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${result.success ? 'text-green-300' : 'text-red-300'}`}>
                        {result.message}
                      </p>
                      {result.success && result.credits && (
                        <div className="mt-2 text-white/80 text-sm space-y-1">
                          <p>• 充值积分：<span className="font-bold text-yellow-300">{result.credits} 积分</span></p>
                          <p>• 当前余额：<span className="font-bold text-yellow-300">{result.newBalance} 积分</span></p>
                          <p className="text-green-300 mt-2">✨ 3秒后自动跳转到积分页面...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h3 className="text-blue-300 font-medium mb-2">💡 使用说明</h3>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• 每个兑换码只能使用一次</li>
              <li>• 兑换后积分立即到账</li>
              <li>• 请妥善保管您的兑换码</li>
              <li>• 如有问题请联系客服</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}



