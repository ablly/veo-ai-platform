import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, Errors } from "@/lib/error-handler"

// 管理员邮箱列表
const ADMIN_EMAILS = [
  "3533912007@qq.com"
]

/**
 * 验证管理员权限
 */
export async function verifyAdminPermission() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return { isAdmin: false, error: "未登录" }
  }
  
  if (!ADMIN_EMAILS.includes(session.user.email)) {
    return { isAdmin: false, error: "无管理员权限" }
  }
  
  return { isAdmin: true, user: session.user }
}

/**
 * 管理员API路由保护中间件
 */
export async function adminApiGuard(request: NextRequest) {
  const { isAdmin, error } = await verifyAdminPermission()
  
  if (!isAdmin) {
    return createErrorResponse(Errors.UNAUTHORIZED, error || "无管理员权限")
  }
  
  return null // 验证通过
}

/**
 * 检查用户是否为管理员
 */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}








