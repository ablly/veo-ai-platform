"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"

// 动态导入组件避免循环依赖
const StripeSuccessContent = dynamic(() => import("./StripeSuccessContent"), { ssr: false })
const AlipaySuccessContent = dynamic(() => import("../alipay/success/AlipaySuccessContent"), { ssr: false })

/**
 * 统一支付成功页面
 * 根据URL参数自动判断是Stripe还是支付宝支付
 */
export default function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // 检查是否是支付宝回调
  const outTradeNo = searchParams.get('out_trade_no')
  const tradeNo = searchParams.get('trade_no')
  
  // 检查是否是Stripe回调
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // 如果有支付宝参数，重定向到支付宝成功页面
    if (outTradeNo) {
      const params = new URLSearchParams()
      params.set('out_trade_no', outTradeNo)
      if (tradeNo) params.set('trade_no', tradeNo)
      router.replace(`/payment/alipay/success?${params.toString()}`)
      return
    }

    // 如果有Stripe参数，保持在当前页面
    if (sessionId) {
      return
    }

    // 如果没有任何参数，返回首页
    router.replace('/')
  }, [outTradeNo, tradeNo, sessionId, router])

  // 根据参数显示对应的成功页面
  if (outTradeNo) {
    return <AlipaySuccessContent />
  }

  if (sessionId) {
    return <StripeSuccessContent />
  }

  // 加载中
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )
}
