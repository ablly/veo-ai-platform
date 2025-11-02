"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Zap, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'success'>('email')
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // 发送重置密码验证码
  const handleSendCode = async () => {
    if (!email) {
      setError("请输入邮箱地址")
      return
    }

    setIsSendingCode(true)
    setError("")

    try {
      const response = await fetch('/api/auth/forgot-password/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('verify')
        setCountdown(60)
        if (data.devCode) {
          console.log("🔑 开发环境重置密码验证码:", data.devCode)
        }
      } else {
        setError(data.error || "发送验证码失败")
      }
    } catch (error) {
      console.error("发送验证码错误:", error)
      setError("发送验证码失败，请稍后重试")
    } finally {
      setIsSendingCode(false)
    }
  }

  // 重新发送验证码
  const handleResendCode = async () => {
    await handleSendCode()
  }

  // 重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 表单验证
    if (!code) {
      setError("请输入验证码")
      setIsLoading(false)
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError("密码至少需要6个字符")
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          code,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login?message=密码重置成功，请使用新密码登录')
        }, 3000)
      } else {
        setError(data.error || "重置密码失败")
      }
    } catch (error) {
      console.error("重置密码错误:", error)
      setError("重置密码失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 成功页面
  if (step === 'success') {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          className="text-center text-white z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold mb-4">密码重置成功！</h1>
          <p className="text-white/70 text-lg mb-6">
            您的密码已成功重置，正在跳转到登录页面...
          </p>
          <motion.div
            className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />
      
      {/* 返回登录按钮 */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/login">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回登录
          </Button>
        </Link>
      </motion.div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <motion.div
                className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Lock className="w-8 h-8 text-black" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                {step === 'email' ? '忘记密码' : '重置密码'}
              </CardTitle>
              <CardDescription className="text-white/70 text-base">
                {step === 'email' 
                  ? '输入您的邮箱地址，我们将发送验证码' 
                  : '输入验证码和新密码以重置您的密码'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {step === 'email' ? (
                // 步骤1: 输入邮箱
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8"
                        placeholder="输入您的注册邮箱"
                        required
                        disabled={isSendingCode}
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    onClick={handleSendCode}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 text-lg"
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      "发送验证码"
                    )}
                  </Button>

                  <div className="text-center">
                    <p className="text-white/60 text-sm">
                      💡 提示：验证码将发送到您的注册邮箱，有效期10分钟
                    </p>
                  </div>
                </div>
              ) : (
                // 步骤2: 输入验证码和新密码
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-display" className="text-white">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="email-display"
                        type="email"
                        value={email}
                        className="pl-10 bg-white/5 backdrop-blur-sm border-white/30 text-white/70"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-white">验证码</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="code"
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8 text-center text-lg tracking-widest"
                          placeholder="6位验证码"
                          maxLength={6}
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleResendCode}
                        disabled={countdown > 0 || isSendingCode}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 whitespace-nowrap"
                      >
                        {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "重新发送"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-white">新密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8"
                        placeholder="输入新密码（6位以上）"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white">确认新密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8"
                        placeholder="再次输入新密码"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      "重置密码"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep('email')}
                      className="text-sm text-yellow-400 hover:text-yellow-300"
                    >
                      ← 返回修改邮箱
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}



















