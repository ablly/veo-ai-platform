import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 管理员邮箱白名单
const ADMIN_EMAILS = ["3533912007@qq.com"]

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // 检查是否访问管理员路由
    if (pathname.startsWith('/admin')) {
      // 如果没有token，重定向到管理员登录页
      if (!token) {
        const loginUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(loginUrl)
      }

      // 如果不是管理员邮箱，重定向到管理员登录页
      if (!token.email || !ADMIN_EMAILS.includes(token.email)) {
        const loginUrl = new URL('/admin/login', req.url)
        return NextResponse.redirect(loginUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // 对于管理员路由，需要严格验证
        if (pathname.startsWith('/admin')) {
          // 排除登录页面本身
          if (pathname === '/admin/login') {
            return true
          }
          
          // 检查是否有有效token和管理员权限
          return !!(token?.email && ADMIN_EMAILS.includes(token.email))
        }

        // 其他路由允许访问
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}






