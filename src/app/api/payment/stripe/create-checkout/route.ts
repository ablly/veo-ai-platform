import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import Stripe from "stripe"
import pool from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia"
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "请先登录" },
        { status: 401 }
      )
    }

    const { packageId } = await request.json()

    // 获取套餐信息
    const client = await pool.connect()
    try {
      const packageResult = await client.query(
        `SELECT id, name, credits, usd_price::numeric as usd_price, stripe_price_id 
         FROM credit_packages 
         WHERE id = $1 AND is_active = true`,
        [packageId]
      )

      if (packageResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "套餐不存在" },
          { status: 404 }
        )
      }

      const pkg = packageResult.rows[0]

      if (!pkg.stripe_price_id) {
        return NextResponse.json(
          { success: false, message: "该套餐不支持Stripe支付" },
          { status: 400 }
        )
      }

      // 获取用户ID
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { success: false, message: "用户不存在" },
          { status: 404 }
        )
      }

      const userId = userResult.rows[0].id

      // 生成订单号
      const orderNumber = `STRIPE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 创建订单记录
      const orderResult = await client.query(
        `INSERT INTO credit_orders (
          user_id,
          package_id,
          credits_amount,
          payment_amount,
          currency,
          payment_method,
          status,
          order_number,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
        RETURNING id`,
        [
          userId,
          packageId,
          pkg.credits,
          pkg.usd_price,
          'USD',
          'stripe',
          'PENDING',
          orderNumber
        ]
      )

      const orderId = orderResult.rows[0].id

      // 创建Stripe Checkout Session
      const checkoutSession = await stripe.checkout.sessions.create({
        mode: 'payment',
        // 只启用信用卡支付，避免微信支付和支付宝的配置问题
        payment_method_types: ['card'],
        line_items: [
          {
            price: pkg.stripe_price_id,
            quantity: 1,
          },
        ],
        // 启用优惠券输入
        allow_promotion_codes: true,
        // 移除 customer_email 让用户可以输入任意邮箱
        // customer_email: session.user.email,
        client_reference_id: orderId,
        metadata: {
          orderId,
          packageId,
          userEmail: session.user.email,
          credits: pkg.credits.toString(),
          orderNumber
        },
        success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      })

      // 更新订单的stripe_session_id
      await client.query(
        `UPDATE credit_orders 
         SET stripe_session_id = $1 
         WHERE id = $2`,
        [checkoutSession.id, orderId]
      )

      console.log(`✅ Stripe Checkout创建成功 - 订单: ${orderId}, 用户: ${session.user.email}`)

      return NextResponse.json({
        success: true,
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      })

    } finally {
      client.release()
    }

  } catch (error) {
    console.error("创建Stripe Checkout失败:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "创建支付会话失败",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
