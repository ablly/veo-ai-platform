"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { Eye, EyeOff, Mail, Lock, ArrowLeft, Zap, Phone } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loginMode, setLoginMode] = useState<'password' | 'email-code' | 'phone-code'>('password')
  const [countdown, setCountdown] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const message = searchParams.get("message")
    if (message) {
      setSuccessMessage(message)
    }
  }, [searchParams])

  // 倒计时效果
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    if (!email) {
      setError("请先输入邮箱地址")
      return
    }

    setIsSendingCode(true)
    setError("")

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        setCountdown(60) // 60秒倒计时
        if (data.devCode) {
          console.log("🔑 开发环境邮箱验证码:", data.devCode)
        }
      } else {
        setError(data.error || "发送验证码失败")
      }
    } catch (error) {
      console.error("发送邮箱验证码错误:", error)
      setError("发送验证码失败，请稍后重试")
    } finally {
      setIsSendingCode(false)
    }
  }

  // 发送手机验证码
  const handleSendPhoneCode = async () => {
    if (!phone) {
      setError("请先输入手机号码")
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号码")
      return
    }

    setIsSendingCode(true)
    setError("")

    try {
      const response = await fetch('/api/auth/send-phone-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccessMessage(data.message)
        setCountdown(60) // 60秒倒计时
        if (data.devCode) {
          console.log("🔑 开发环境手机验证码:", data.devCode)
        }
      } else {
        setError(data.error || "发送验证码失败")
      }
    } catch (error) {
      console.error("发送手机验证码错误:", error)
      setError("发送验证码失败，请稍后重试")
    } finally {
      setIsSendingCode(false)
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let result
      
      if (loginMode === 'password') {
        // 密码登录
        result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
      } else if (loginMode === 'email-code') {
        // 邮箱验证码登录
        if (!code) {
          setError("请输入验证码")
          setIsLoading(false)
          return
        }
        
        result = await signIn("email-code", {
          email,
          code,
          redirect: false,
        })
      } else if (loginMode === 'phone-code') {
        // 手机验证码登录
        if (!code) {
          setError("请输入验证码")
          setIsLoading(false)
          return
        }
        
        result = await signIn("phone-code", {
          phone,
          code,
          redirect: false,
        })
      }

      if (result?.error) {
        if (loginMode === 'password') {
          setError("邮箱或密码错误")
        } else if (loginMode === 'email-code') {
          setError("邮箱验证码无效或已过期")
        } else if (loginMode === 'phone-code') {
          setError("手机验证码无效或已过期")
        }
      } else {
        const session = await getSession()
        if (session) {
          // 登录成功后跳转到主页
          router.push("/")
        }
      }
    } catch (error) {
      console.error("登录错误:", error)
      setError("登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatedBackground />
      
      {/* 返回首页按钮 */}
      <motion.div
        className="absolute top-6 left-6 z-20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
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
                <Zap className="w-8 h-8 text-black" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                欢迎回来
              </CardTitle>
              <CardDescription className="text-white/70 text-lg">
                登录到您的VEO AI账户
              </CardDescription>
              
              {successMessage && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <p className="text-green-300 text-sm">{successMessage}</p>
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {/* 登录方式切换 */}
              <div className="flex rounded-lg bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    loginMode === 'password'
                      ? 'bg-yellow-400 text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  账户登录
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('email-code')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    loginMode === 'email-code'
                      ? 'bg-yellow-400 text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  邮箱验证码
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('phone-code')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    loginMode === 'phone-code'
                      ? 'bg-yellow-400 text-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  手机验证码
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 邮箱/手机号输入框 */}
                {loginMode === 'phone-code' ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">手机号码</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        className="pl-10 bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8"
                        placeholder="输入您的手机号码"
                        maxLength={11}
                        required
                      />
                    </div>
                  </div>
                ) : (
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
                        placeholder="输入您的邮箱"
                        required
                      />
                    </div>
                  </div>
                )}

                {loginMode === 'password' ? (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white">密码</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white/5 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-yellow-400 focus:bg-white/10 hover:bg-white/8"
                        placeholder="输入您的密码"
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
                ) : (
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
                        onClick={loginMode === 'email-code' ? handleSendEmailCode : handleSendPhoneCode}
                        disabled={isSendingCode || countdown > 0 || (loginMode === 'email-code' ? !email : !phone)}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 whitespace-nowrap"
                      >
                        {isSendingCode ? "发送中..." : countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </Button>
                    </div>
                  </div>
                )}

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
                    loginMode === 'password' ? "登录" : 
                    loginMode === 'email-code' ? "邮箱验证码登录" : "手机验证码登录"
                  )}
                </Button>
              </form>

              {/* 忘记密码 */}
              {loginMode === 'password' && (
                <div className="text-center">
                  <Link href="/forgot-password" className="text-sm text-red-400 hover:text-red-300">
                    忘记密码?
                  </Link>
                </div>
              )}

              <div className="text-center space-y-4">
                <div className="text-center">
                  <p className="text-white/60 text-sm">
                    💡 提示：支持QQ邮箱、Gmail、163邮箱等所有邮箱类型，以及中国大陆手机号码
                  </p>
                </div>

                <p className="text-white/70">
                  还没有账号？{" "}
                  <Link href="/register" className="text-yellow-400 hover:text-yellow-300 font-medium">
                    立即注册
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}


