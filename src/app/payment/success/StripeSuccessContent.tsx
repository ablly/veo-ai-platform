"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Loader2, Award, ArrowRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function StripeSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [orderInfo, setOrderInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      setError('Invalid payment session')
      setLoading(false)
      return
    }

    // 验证支付会话
    verifyPayment(sessionId)
  }, [searchParams])

  const verifyPayment = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/payment/stripe/verify-session?session_id=${sessionId}`)
      const data = await response.json()

      if (data.success) {
        setOrderInfo(data.order)
      } else {
        setError(data.message || 'Payment verification failed')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setError('Failed to verify payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Verifying your payment...</p>
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
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Payment Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Button
            onClick={() => router.push('/pricing')}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20"
          >
            Back to Pricing
          </Button>
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
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-white/80">
            Thank you for your purchase. Your credits have been added to your account.
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
              <h2 className="text-2xl font-bold text-white">Order Details</h2>
              <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <span className="text-green-300 text-sm font-medium">Completed</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Package</span>
                <span className="text-white font-semibold">{orderInfo.packageName}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Credits</span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold text-xl">{orderInfo.credits}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span className="text-white/70">Amount Paid</span>
                <span className="text-white font-semibold">${orderInfo.amount}</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-white/70">Order Number</span>
                <span className="text-white/60 text-sm font-mono">{orderInfo.orderNumber}</span>
              </div>
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
            <span>Start Creating</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <Button
            onClick={() => router.push('/')}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-6 text-lg"
            size="lg"
          >
            <Home className="w-5 h-5 mr-2" />
            <span>Back to Home</span>
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-white/60 text-sm">
            A confirmation email has been sent to {session?.user?.email}
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
