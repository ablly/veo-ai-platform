import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 增强版订单列表API - 包含用户积分信息
 * GET /api/admin/orders/list-enhanced
 */
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
      whereClause += ` AND (co.order_number ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status !== 'all') {
      whereClause += ` AND co.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // 查询订单列表（包含用户积分信息和支付详情）
    const ordersQuery = `
      SELECT 
        co.id,
        co.order_number,
        co.user_id,
        u.email as user_email,
        u.name as user_name,
        cp.name as package_name,
        cp.credits as order_credits,
        co.payment_amount,
        co.payment_method,
        co.status,
        co.created_at,
        co.payment_time,
        co.alipay_trade_no,
        co.stripe_payment_intent_id,
        uca.available_credits as user_current_credits,
        uca.total_credits as user_total_credits,
        uca.used_credits as user_used_credits,
        uca.package_expires_at as user_package_expires_at,
        uca.package_name as user_current_package
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      LEFT JOIN user_credit_accounts uca ON co.user_id = uca.user_id
      ${whereClause}
      ORDER BY co.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const ordersResult = await pool.query(ordersQuery, queryParams)

    // 查询总数和统计
    const countQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN co.status = 'PAID' OR co.status = 'COMPLETED' THEN co.payment_amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN co.status = 'PENDING' THEN 1 END) as pending_count,
        COUNT(CASE WHEN co.status = 'PAID' OR co.status = 'COMPLETED' THEN 1 END) as completed_count
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalOrders = parseInt(countResult.rows[0].total)
    const totalRevenue = parseFloat(countResult.rows[0].total_revenue || '0')
    const pendingCount = parseInt(countResult.rows[0].pending_count || '0')
    const completedCount = parseInt(countResult.rows[0].completed_count || '0')
    const totalPages = Math.ceil(totalOrders / limit)

    logger.info("管理员查询增强订单列表", {
      page,
      limit,
      search,
      status,
      total_orders: totalOrders
    })

    return NextResponse.json({
      success: true,
      orders: ordersResult.rows,
      statistics: {
        totalOrders,
        totalRevenue,
        pendingCount,
        completedCount,
        totalPages,
        currentPage: page
      }
    })

  } catch (error) {
    logger.error("查询增强订单列表失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询订单列表失败")
  }
}
