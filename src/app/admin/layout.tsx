"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Video, 
  BarChart3, 
  Settings,
  LogOut,
  Shield,
  Mail
} from "lucide-react"

const adminNavItems = [
  {
    name: "统计概览",
    href: "/admin/statistics",
    icon: BarChart3
  },
  {
    name: "用户管理",
    href: "/admin/users",
    icon: Users
  },
  {
    name: "订单管理", 
    href: "/admin/orders",
    icon: CreditCard
  },
  {
    name: "视频管理",
    href: "/admin/videos", 
    icon: Video
  },
  {
    name: "视频监控",
    href: "/admin/videos/monitor", 
    icon: BarChart3
  },
  {
    name: "消息通知",
    href: "/admin/notifications",
    icon: Mail
  },
  {
    name: "营销邮件",
    href: "/admin/marketing-emails",
    icon: Mail
  },
  {
    name: "系统设置",
    href: "/admin/settings",
    icon: Settings
  }
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [permissionChecked, setPermissionChecked] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  // 严格的权限检查
  useEffect(() => {
    // 如果是登录页，跳过权限检查
    if (pathname === "/admin/login") {
      return
    }
    if (status === "loading") return

    if (!session?.user?.email) {
      console.log("❌ 未登录，重定向到登录页")
      redirect("/admin/login")
      return
    }

    // 验证管理员权限
    const isAdmin = session.user.email === "3533912007@qq.com"
    console.log("🔍 权限检查:", { email: session.user.email, isAdmin })
    
    setHasPermission(isAdmin)
    setPermissionChecked(true)

    if (!isAdmin) {
      console.log("❌ 非管理员，延迟重定向")
      // 延迟重定向，给用户看到拒绝信息
      setTimeout(() => {
        redirect("/admin/login")
      }, 3000)
    } else {
      console.log("✅ 管理员权限验证通过")
    }
  }, [session, status, pathname])

  // 如果是登录页，直接渲染子组件，不进行权限检查
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // 强制检查：如果没有会话或权限，立即阻止渲染
  if (status !== "loading" && (!session?.user?.email || session.user.email !== "3533912007@qq.com")) {
    if (!permissionChecked) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">验证管理员权限中...</p>
          </div>
        </div>
      )
    }
  }

  if (status === "loading" || !permissionChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">验证管理员权限中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    redirect("/admin/login")
    return null
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
          <p className="text-gray-600 mb-4">您没有访问管理后台的权限</p>
        
          <div className="space-y-2">
            <Link 
              href="/admin/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
            >
              重新登录
            </Link>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 侧边栏 */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">V</span>
            </div>
            <span className="text-white font-bold text-xl">管理后台</span>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {session.user?.name?.charAt(0) || "A"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session.user?.name || "管理员"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user?.email}
              </p>
            </div>
          </div>
          
          <Link
            href="/"
            className="mt-3 w-full flex items-center justify-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            返回前台
          </Link>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="ml-64">
        {/* 顶部栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {adminNavItems.find(item => item.href === pathname)?.name || "管理后台"}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  欢迎，{session.user?.name}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
