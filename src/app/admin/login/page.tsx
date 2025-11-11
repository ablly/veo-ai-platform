"use client"

import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Mail, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AdminLoginPage() {
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    )
  }

  const sendVerificationCode = async () => {
    if (!email) {
      setError("请输入邮箱地址")
      return
    }

    // 验证是否为管理员邮箱
    if (email !== "3533912007@qq.com") {
      setError("此邮箱没有管理员权限")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("验证码已发送到您的邮箱")
        setStep('code')
      } else {
        setError(data.message || "发送验证码失败")
      }
    } catch (error) {
      setError("网络错误，请重试")
    } finally {
      setLoading(false)
    }
  }

  const verifyCodeAndLogin = async () => {
    if (!code) {
      setError("请输入验证码")
      return
    }

    setLoading(true)
    setError("")

    try {
      const result = await signIn('email-code', {
        email,
        code,
        redirect: false
      })

      if (result?.error) {
        setError("验证码错误或已过期")
      } else {
        // 验证登录成功后检查权限
        const session = await getSession()
        if (session?.user?.email === "3533912007@qq.com") {
          router.push('/admin/statistics')
        } else {
          setError("登录失败，没有管理员权限")
        }
      }
    } catch (error) {
      setError("登录失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* 返回首页链接 */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Link>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">管理员登录</h1>
            <p className="text-white/70">使用QQ邮箱验证码登录管理后台</p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* 邮箱输入步骤 */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  管理员邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入管理员QQ邮箱"
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && sendVerificationCode()}
                  />
                </div>
                <p className="mt-2 text-white/60 text-xs">
                  仅限管理员邮箱：3533912007@qq.com
                </p>
              </div>

              <button
                onClick={sendVerificationCode}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    发送验证码
                  </>
                )}
              </button>
            </div>
          )}

          {/* 验证码输入步骤 */}
          {step === 'code' && (
            <div className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  邮箱验证码
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-mono placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && verifyCodeAndLogin()}
                />
                <p className="mt-2 text-white/60 text-xs text-center">
                  验证码已发送到 {email}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={verifyCodeAndLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      登录管理后台
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setStep('email')
                    setCode("")
                    setError("")
                    setSuccess("")
                  }}
                  className="w-full px-4 py-2 text-white/70 hover:text-white text-sm transition-colors"
                >
                  重新发送验证码
                </button>
              </div>
            </div>
          )}

          {/* 安全提示 */}
          <div className="mt-8 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-200 font-medium text-sm">安全提示</h3>
                <p className="text-yellow-200/80 text-xs mt-1">
                  管理员后台具有系统最高权限，请确保您是授权管理员。如非本人操作，请立即联系系统管理员。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-6">
          <p className="text-white/50 text-sm">
            VEO AI 管理后台 © 2025
          </p>
        </div>
      </div>
    </div>
  )
}
