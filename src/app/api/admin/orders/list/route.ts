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
      whereClause += ` AND (co.id::text ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR co.payment_id ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status !== 'all') {
      whereClause += ` AND co.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // 查询订单列表
    const ordersQuery = `
      SELECT 
        co.id,
        co.user_id,
        u.email as user_email,
        u.name as user_name,
        cp.name as package_name,
        cp.credits,
        co.payment_amount,
        co.payment_method,
        co.status,
        co.created_at,
        co.payment_time,
        co.order_number
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
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
        SUM(CASE WHEN co.status = 'COMPLETED' THEN co.payment_amount ELSE 0 END) as total_revenue
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalOrders = parseInt(countResult.rows[0].total)
    const totalRevenue = parseFloat(countResult.rows[0].total_revenue || '0')
    const totalPages = Math.ceil(totalOrders / limit)

    logger.info("管理员查询订单列表", {
      page,
      limit,
      search,
      status,
      total_orders: totalOrders
    })

    return NextResponse.json({
      success: true,
      orders: ordersResult.rows,
      totalOrders,
      totalRevenue,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    logger.error("查询订单列表失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询订单列表失败")
  }
}