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
        { success: false, message: "Session ID is required" },
        { status: 400 }
      )
    }

    // 从 Stripe 获取会话信息
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      )
    }

    // 获取订单信息
    const orderId = session.client_reference_id || session.metadata?.orderId

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID not found" },
        { status: 404 }
      )
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT 
          co.id,
          co.order_number,
          co.credits_amount,
          co.payment_amount,
          co.status,
          cp.name as package_name
        FROM credit_orders co
        JOIN credit_packages cp ON co.package_id = cp.id
        WHERE co.id = $1`,
        [orderId]
      )

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        )
      }

      const order = result.rows[0]

      // 计算实际到账积分（包含首单赠送）
      // 查询该订单相关的所有积分交易记录
      const transactionsResult = await client.query(
        `SELECT SUM(credit_amount) as total_credits
         FROM credit_transactions
         WHERE related_order_id = $1 AND transaction_type IN ('PURCHASE', 'BONUS')`,
        [orderId]
      )
      
      // 实际到账积分 = 购买积分 + 赠送积分
      const actualCredits = transactionsResult.rows[0]?.total_credits || order.credits_amount
      
      console.log(`💎 Stripe订单积分: 套餐${order.credits_amount}, 实际到账${actualCredits}`)

      return NextResponse.json({
        success: true,
        order: {
          orderNumber: order.order_number,
          credits: parseInt(actualCredits), // 返回实际到账积分
          amount: parseFloat(order.payment_amount),
          status: order.status,
          packageName: order.package_name
        }
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("Verify session error:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to verify payment session",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
