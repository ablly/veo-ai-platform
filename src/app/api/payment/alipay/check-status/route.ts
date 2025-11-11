import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

/**
 * 查询支付宝订单状态
 * GET /api/payment/alipay/check-status?orderId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ success: false, message: '缺少订单ID' }, { status: 400 })
    }

    // 查询订单状态
    const result = await pool.query(
      `SELECT co.*, u.email 
       FROM credit_orders co
       JOIN users u ON co.user_id = u.id
       WHERE co.order_number = $1 AND u.email = $2`,
      [orderId, session.user.email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: '订单不存在' }, { status: 404 })
    }

    const order = result.rows[0]

    return NextResponse.json({
      success: true,
      orderId: order.order_number,
      status: order.status, // PENDING, PAID, FAILED, CANCELLED
      amount: order.amount,
      credits: order.credits,
      createdAt: order.created_at,
      paidAt: order.paid_at
    })

  } catch (error) {
    console.error('查询订单状态失败:', error)
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    )
  }
}
