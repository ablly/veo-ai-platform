import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const offset = (page - 1) * limit

    // 构建搜索条件
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status !== 'all') {
      whereClause += ` AND u.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // 查询用户列表 - 生产级查询
    const usersQuery = `
      SELECT 
        u.id,
        u.email,
        u.name,
        u.avatar,
        u.created_at,
        COALESCE(u.status, 'active') as status,
        COALESCE(uca.available_credits, 0) as available_credits,
        COALESCE(uca.total_credits, 0) as total_credits,
        COALESCE(uca.used_credits, 0) as used_credits,
        COALESCE(order_stats.total_orders, 0) as total_orders,
        COALESCE(video_stats.total_videos, 0) as total_videos
      FROM users u
      LEFT JOIN user_credit_accounts uca ON u.id = uca.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_orders
        FROM credit_orders
        WHERE status = 'COMPLETED'
        GROUP BY user_id
      ) order_stats ON u.id = order_stats.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as total_videos
        FROM video_generations
        WHERE status = 'COMPLETED'
        GROUP BY user_id
      ) video_stats ON u.id = video_stats.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const usersResult = await pool.query(usersQuery, queryParams)

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalUsers = parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(totalUsers / limit)

    logger.info("管理员查询用户列表", {
      page,
      limit,
      search,
      status,
      total_users: totalUsers
    })

    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      totalUsers,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    logger.error("查询用户列表失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询用户列表失败")
  }
}