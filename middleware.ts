import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 强制HTTPS跳转
  const proto = request.headers.get('x-forwarded-proto')
  
  if (proto === 'http') {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, 301)
  }

  return NextResponse.next()
}

// 匹配所有路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了以下开头的：
     * - api (API routes)
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
