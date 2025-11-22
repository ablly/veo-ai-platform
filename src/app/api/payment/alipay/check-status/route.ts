import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

/**
 * 检查支付宝订单状态
 * GET /api/payment/alipay/check-status?out_trade_no=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const outTradeNo = searchParams.get('out_trade_no')

    if (!outTradeNo) {
      return NextResponse.json({
        success: false,
        message: '订单号缺失'
      }, { status: 400 })
    }

    console.log(`🔍 查询订单状态: ${outTradeNo}`)

    // 查询订单信息
    const orderResult = await pool.query(
      `SELECT 
        co.order_number,
        co.status,
        co.payment_time,
        co.credits_amount,
        co.payment_amount,
        cp.name as package_name,
        uca.package_expires_at
      FROM credit_orders co
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      LEFT JOIN user_credit_accounts uca ON co.user_id = uca.user_id
      WHERE co.order_number = $1`,
      [outTradeNo]
    )

    if (orderResult.rows.length === 0) {
      console.error(`❌ 订单不存在: ${outTradeNo}`)
      return NextResponse.json({
        success: false,
        message: '订单不存在'
      }, { status: 404 })
    }

    const order = orderResult.rows[0]
    console.log(`✅ 订单状态: ${order.status}`)

    // 检查订单是否已支付
    if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
      return NextResponse.json({
        success: false,
        message: '订单尚未支付或支付失败',
        order: {
          status: order.status
        }
      })
    }

    // 返回订单信息
    return NextResponse.json({
      success: true,
      message: '订单已支付',
      order: {
        orderNumber: order.order_number,
        status: order.status,
        packageName: order.package_name,
        credits: order.credits_amount,
        amount: parseFloat(order.payment_amount),
        paymentTime: order.payment_time,
        expiresAt: order.package_expires_at 
          ? new Date(order.package_expires_at).toLocaleDateString('zh-CN')
          : null
      }
    })

  } catch (error) {
    console.error('查询订单状态失败:', error)
    return NextResponse.json({
      success: false,
      message: '查询订单状态失败'
    }, { status: 500 })
  }
}
