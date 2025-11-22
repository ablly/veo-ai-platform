"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Loader2, Award, ArrowRight, Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function AlipaySuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const outTradeNo = searchParams.get('out_trade_no')
    const tradeNo = searchParams.get('trade_no')
    
    if (!outTradeNo) {
      setError('订单号缺失')
      setLoading(false)
      return
    }

    // 验证支付结果
    verifyPayment(outTradeNo, tradeNo)
  }, [searchParams])

  const verifyPayment = async (outTradeNo: string, tradeNo: string | null) => {
    try {
      const response = await fetch(`/api/payment/alipay/check-status?out_trade_no=${outTradeNo}`)
      const data = await response.json()

      if (data.success) {
        setOrderInfo({
          orderNumber: outTradeNo,
          alipayTradeNo: tradeNo,
          ...data.order
        })
      } else {
        setError(data.message || '支付验证失败')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('支付验证失败，请稍后查看订单状态')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">正在验证支付结果...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">支付验证中</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <p className="text-white/60 text-sm mb-6">
            如果您已完成支付，积分将在几分钟内到账。
            <br />
            您可以在"我的积分"中查看订单状态。
          </p>
          <div className="grid gap-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
            >
              返回首页
            </Button>
            <Button
              onClick={() => router.push('/pricing')}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20"
            >
              查看套餐
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            支付成功！🎉
          </h1>
          <p className="text-xl text-white/80">
            感谢您的购买，积分已充值到您的账户
          </p>
        </motion.div>

        {/* Order Details */}
        {orderInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">订单详情</h2>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-300 text-sm font-medium">已完成</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">套餐名称</span>
                <span className="text-white font-semibold">{orderInfo.packageName || '积分套餐'}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">获得积分</span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold text-xl">{orderInfo.credits || 0}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">支付金额</span>
                <span className="text-white font-semibold">¥{orderInfo.amount || 0}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">订单号</span>
                <span className="text-white/60 text-sm font-mono">{orderInfo.orderNumber}</span>
              </div>

              {orderInfo.alipayTradeNo && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-white/70">支付宝交易号</span>
                  <span className="text-white/60 text-sm font-mono">{orderInfo.alipayTradeNo}</span>
                </div>
              )}

              {orderInfo.expiresAt && (
                <div className="flex justify-between items-center py-3 pt-4 border-t border-white/10">
                  <span className="text-white/70">有效期至</span>
                  <span className="text-yellow-300 font-medium">{orderInfo.expiresAt}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-6 text-lg"
            size="lg"
          >
            <span>开始创作</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={() => router.push('/')}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-6 text-lg"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>返回首页</span>
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center space-y-2"
        >
          <p className="text-white/60 text-sm">
            确认邮件已发送至 {session?.user?.email}
          </p>
          <p className="text-white/50 text-xs">
            如有疑问，请联系客服
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
