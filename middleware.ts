import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取用户地理位置
  const country = request.geo?.country || 
                  (process.env.NODE_ENV === 'development' ? 'CN' : 'US')
  
  // 判断是否为中国用户
  const region = country === 'CN' ? 'CN' : 'INTL'
  
  // 创建响应
  const response = NextResponse.next()
  
  // 设置Cookie（24小时有效）
  response.cookies.set('user_region', region, {
    maxAge: 60 * 60 * 24,
    path: '/',
    sameSite: 'lax'
  })
  
  // 同时设置Header供服务端组件使用
  response.headers.set('x-user-region', region)
  response.headers.set('x-user-country', country)
  
  return response
}

// 配置需要运行middleware的路径
export const config = {
  matcher: [
    '/pricing',
    '/api/payment/:path*',
    '/api/credits/:path*'
  ]
}
