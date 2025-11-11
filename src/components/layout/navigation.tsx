"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, LogOut, Settings, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: session, status } = useSession()
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <nav className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50" suppressHydrationWarning={true}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div>
              <span className="font-bold text-2xl text-white">VEO AI</span>
              <div className="text-xs text-white/60 -mt-1">视频创作平台</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/generate" className="text-white/80 hover:text-white transition-colors relative group" prefetch={true}>
              视频生成
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/pricing" className="text-white/80 hover:text-white transition-colors relative group">
              套餐充值
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/gallery" className="text-white/80 hover:text-white transition-colors relative group">
              作品展示
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="/docs" className="text-white/80 hover:text-white transition-colors relative group">
              使用指南
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!mounted || status === "loading" ? (
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10 p-2"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                      {session.user?.image ? (
                        <img 
                          src={session.user.image} 
                          alt={session.user.name || "用户头像"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-black" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{session.user?.name}</span>
                  </div>
                </Button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-64 bg-white/90 backdrop-blur-xl border border-white/30 rounded-xl shadow-2xl"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center overflow-hidden">
                            {session.user?.image ? (
                              <img 
                                src={session.user.image} 
                                alt={session.user.name || "用户头像"} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-6 h-6 text-black" />
                            )}
                          </div>
                          <div>
                            <div className="text-black font-medium">{session.user?.name}</div>
                            <div className="text-black/60 text-sm">{session.user?.email}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                  <Link href="/profile" className="flex items-center space-x-2 text-black/80 hover:text-black p-2 rounded-lg hover:bg-black/10 transition-colors" prefetch={true}>
                    <User className="w-4 h-4" />
                    <span>个人中心</span>
                  </Link>
                  <Link href="/my-videos" className="flex items-center space-x-2 text-black/80 hover:text-black p-2 rounded-lg hover:bg-black/10 transition-colors" prefetch={true}>
                    <Settings className="w-4 h-4" />
                    <span>我的视频</span>
                  </Link>
                  <Link href="/credits" className="flex items-center space-x-2 text-black/80 hover:text-black p-2 rounded-lg hover:bg-black/10 transition-colors" prefetch={true}>
                    <CreditCard className="w-4 h-4" />
                    <span>积分管理</span>
                  </Link>
                          <button
                            onClick={() => signOut()}
                            className="flex items-center space-x-2 text-black/80 hover:text-black p-2 rounded-lg hover:bg-black/10 transition-colors w-full text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>退出登录</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/login" prefetch={true}>
                  <Button variant="ghost" className="text-white hover:bg-white/10">
                    登录
                  </Button>
                </Link>
                <Link href="/register" prefetch={true}>
                  <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold">
                    免费注册
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col space-y-4">
              <Link href="/generate" className="text-white/80 hover:text-white transition-colors px-2 py-1">
                视频生成
              </Link>
              <Link href="/pricing" className="text-white/80 hover:text-white transition-colors px-2 py-1">
                套餐充值
              </Link>
              <Link href="/gallery" className="text-white/80 hover:text-white transition-colors px-2 py-1">
                作品展示
              </Link>
              <Link href="/docs" className="text-white/80 hover:text-white transition-colors px-2 py-1">
                使用指南
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="w-full text-white hover:bg-white/10">
                    登录
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold">
                    免费注册
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
