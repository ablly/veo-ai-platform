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

    // 查询所有订单数据
    const ordersQuery = `
      SELECT 
        co.id as "订单ID",
        u.email as "用户邮箱",
        u.name as "用户姓名",
        cp.name as "套餐名称",
        cp.credits as "积分数量",
        co.payment_amount as "支付金额",
        co.payment_method as "支付方式",
        co.status as "订单状态",
        co.created_at as "创建时间",
        co.payment_time as "支付时间",
        co.order_number as "订单号"
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      ORDER BY co.created_at DESC
    `

    const ordersResult = await pool.query(ordersQuery)

    // 生成CSV内容
    const headers = Object.keys(ordersResult.rows[0] || {})
    let csvContent = headers.join(',') + '\n'
    
    ordersResult.rows.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        if (value === null || value === undefined) return ''
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      csvContent += values.join(',') + '\n'
    })

    logger.info("管理员导出订单数据", {
      total_orders: ordersResult.rows.length
    })

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    logger.error("导出订单数据失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "导出订单数据失败")
  }
}
