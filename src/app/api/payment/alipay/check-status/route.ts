import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

/**
 * 查询支付宝订单状态
 * GET /api/payment/alipay/check-status?out_trade_no=xxx
 * GET /api/payment/alipay/check-status?orderId=xxx (兼容旧版)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const outTradeNo = searchParams.get('out_trade_no') || searchParams.get('orderId')

    if (!outTradeNo) {
      return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 })
    }

    // 查询订单状态（不需要登录验证，因为是支付宝回调）
    const result = await pool.query(
      `SELECT 
        co.order_number,
        co.status,
        co.payment_amount,
        co.credits_amount,
        co.created_at,
        co.payment_time,
        cp.name as package_name,
        uca.package_expires_at
       FROM credit_orders co
       LEFT JOIN credit_packages cp ON co.package_id = cp.id
       LEFT JOIN user_credit_accounts uca ON co.user_id = uca.user_id
       WHERE co.order_number = $1`,
      [outTradeNo]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: '订单不存在' }, { status: 404 })
    }

    const order = result.rows[0]

    // 格式化过期时间
    let expiresAt = null
    if (order.package_expires_at) {
      expiresAt = new Date(order.package_expires_at).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.order_number,
        status: order.status,
        amount: parseFloat(order.payment_amount),
        credits: order.credits_amount,
        packageName: order.package_name,
        expiresAt: expiresAt,
        createdAt: order.created_at,
        paidAt: order.payment_time
      }
    })

  } catch (error) {
    console.error('查询订单状态失败:', error)
    return NextResponse.json(
      { success: false, message: '查询失败' },
      { status: 500 }
    )
  }
}
