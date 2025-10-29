import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 获取用户详细信息（管理员）
 * GET /api/admin/users/[id]/details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const resolvedParams = await params
    const userId = resolvedParams.id

    // 查询用户基本信息
    const userResult = await pool.query(
      `SELECT 
        u.*,
        COALESCE(uca.available_credits, 0) as available_credits,
        COALESCE(uca.total_credits, 0) as total_credits,
        COALESCE(uca.used_credits, 0) as used_credits,
        uca.package_name,
        uca.package_expires_at,
        uca.is_expired,
        uca.last_notification_at
      FROM users u
      LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id
      WHERE u.id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return createErrorResponse(Errors.NOT_FOUND, "用户不存在")
    }

    const user = userResult.rows[0]

    // 查询最近订单
    const ordersResult = await pool.query(
      `SELECT * FROM credit_orders 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    )

    // 查询最近视频
    const videosResult = await pool.query(
      `SELECT * FROM video_generations 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    )

    // 查询积分交易记录
    const transactionsResult = await pool.query(
      `SELECT * FROM credit_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    )

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        createdAt: user.created_at,
        credits: {
          available: parseInt(user.available_credits),
          total: parseInt(user.total_credits),
          used: parseInt(user.used_credits)
        },
        package: {
          name: user.package_name,
          expiresAt: user.package_expires_at,
          isExpired: user.is_expired,
          lastNotificationAt: user.last_notification_at
        }
      },
      recentOrders: ordersResult.rows,
      recentVideos: videosResult.rows,
      recentTransactions: transactionsResult.rows
    })

  } catch (error) {
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "获取用户详情失败")
  }
}


