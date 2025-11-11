import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 查询用户积分余额
    const result = await pool.query(
      `SELECT 
         u.id,
         u.email,
         u.created_at,
         u.updated_at,
         COALESCE(uca.available_credits, 0) as available_credits,
         COALESCE(uca.total_credits, 0) as total_credits,
         COALESCE(uca.used_credits, 0) as used_credits
       FROM users u
       LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id
       WHERE u.email = $1`,
      [session.user.email]
    )

    if (result.rows.length === 0) {
      return createErrorResponse(Errors.NOT_FOUND, "用户不存在")
    }

    const user = result.rows[0]
    
    const credits = {
      available: user.available_credits || 0,
      total_earned: user.total_credits || 0,
      total_used: user.used_credits || 0,
      total: user.total_credits || 0,
      used: user.used_credits || 0,
      frozen: 0, // 添加frozen字段以兼容前端
      last_updated: user.updated_at
    }

    logger.info("用户积分余额查询成功", {
      user_email: session.user.email,
      available_credits: credits.available
    })

    return NextResponse.json({
      success: true,
      credits
    })

  } catch (error) {
    logger.error("积分余额查询失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}
