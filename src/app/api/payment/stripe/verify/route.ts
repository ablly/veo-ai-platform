import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import pool from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover"
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "缺少session_id" },
        { status: 400 }
      )
    }

    // 从Stripe获取session信息
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({
        success: false,
        status: session.payment_status,
        message: "支付未完成"
      })
    }

    // 查询订单状态
    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT co.*, cp.name as package_name, cp.credits
         FROM credit_orders co
         JOIN credit_packages cp ON co.package_id = cp.id
         WHERE co.stripe_session_id = $1`,
        [sessionId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({
          success: false,
          message: "订单不存在"
        }, { status: 404 })
      }

      const order = result.rows[0]

      return NextResponse.json({
        success: true,
        order: {
          id: order.id,
          status: order.status,
          packageName: order.package_name,
          credits: order.credits,
          amount: parseFloat(order.payment_amount),
          currency: order.currency,
          paidAt: order.payment_time
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("验证支付失败:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "验证支付失败",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
