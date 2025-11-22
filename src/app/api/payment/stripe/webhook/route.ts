import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import pool from "@/lib/db"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover"
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook签名验证失败:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const client = await pool.connect()

  try {
    // 处理checkout.session.completed事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const orderId = session.client_reference_id || session.metadata?.orderId

      if (!orderId) {
        console.error('订单ID缺失')
        return NextResponse.json({ received: true })
      }

      // 检查订单是否已处理（幂等性）
      const orderCheck = await client.query(
        'SELECT status, user_id FROM credit_orders WHERE id = $1',
        [orderId]
      )

      if (orderCheck.rows.length === 0) {
        console.error('订单不存在:', orderId)
        return NextResponse.json({ received: true })
      }

      if (orderCheck.rows[0].status === 'COMPLETED') {
        console.log('订单已处理，跳过:', orderId)
        return NextResponse.json({ received: true })
      }

      const userId = orderCheck.rows[0].user_id

      // 更新订单状态
      await client.query(
        `UPDATE credit_orders 
         SET status = $1,
             stripe_payment_intent_id = $2,
             payment_time = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        ['COMPLETED', session.payment_intent, orderId]
      )

      // 获取订单信息
      const orderResult = await client.query(
        `SELECT co.credits_amount, cp.name as package_name, u.email
         FROM credit_orders co
         JOIN credit_packages cp ON co.package_id = cp.id
         JOIN users u ON co.user_id = u.id
         WHERE co.id = $1`,
        [orderId]
      )

      const order = orderResult.rows[0]

      // 增加用户积分
      await client.query(
        `INSERT INTO user_credit_accounts (user_id, total_credits, available_credits, used_credits, frozen_credits, created_at, updated_at)
         VALUES ($1, $2, $2, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           total_credits = user_credit_accounts.total_credits + $2,
           available_credits = user_credit_accounts.available_credits + $2,
           updated_at = NOW()`,
        [userId, order.credits_amount]
      )

      // 记录积分变动历史
      const balanceResult = await client.query(
        'SELECT available_credits FROM user_credit_accounts WHERE user_id = $1',
        [userId]
      )
      const currentBalance = balanceResult.rows[0].available_credits

      await client.query(
        `INSERT INTO credit_transactions (
          user_id,
          transaction_type,
          credit_amount,
          balance_before,
          balance_after,
          related_order_id,
          package_id,
          description,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, (SELECT package_id FROM credit_orders WHERE id = $6), $7, NOW())`,
        [
          userId,
          'PURCHASE',
          order.credits_amount,
          currentBalance - order.credits_amount,
          currentBalance,
          orderId,
          `购买${order.package_name}套餐 (Stripe)`
        ]
      )

      // 查询用户信息用于发送邮件
      const userResult = await client.query(
        'SELECT email, name FROM users WHERE id = $1',
        [userId]
      )
      const user = userResult.rows[0]

      // 查询套餐信息
      const packageResult = await client.query(
        'SELECT name, credits FROM credit_packages WHERE id = (SELECT package_id FROM credit_orders WHERE id = $1)',
        [orderId]
      )
      const packageInfo = packageResult.rows[0]

      // 计算过期时间
      let validityDays = 30
      if (packageInfo.name.includes('新手')) validityDays = 7
      if (packageInfo.name.includes('专业')) validityDays = 90
      if (packageInfo.name.includes('企业')) validityDays = 180
      
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)

      console.log(`✅ Stripe支付成功 - 订单: ${orderId}, 用户: ${user.email}, 积分: ${order.credits_amount}`)

      // 发送购买成功邮件给用户（异步）
      const { EmailService } = await import('@/lib/email')
      EmailService.sendPurchaseSuccess({
        email: user.email,
        userName: user.name || user.email.split('@')[0],
        packageName: packageInfo.name,
        credits: packageInfo.credits,
        expiresAt: expiresAt.toLocaleDateString('zh-CN'),
        amount: parseFloat(order.payment_amount)
      }).catch(error => {
        console.error('发送购买成功邮件失败:', error)
      })

      // 发送订单通知给管理员（异步）
      try {
        console.log('📧 开始发送管理员订单通知邮件 (Stripe)...')
        console.log('📧 管理员邮箱:', process.env.ADMIN_EMAIL)
        
        const adminEmailResult = await EmailService.sendAdminOrderNotification({
          orderNumber: order.order_number,
          userName: user.name || user.email.split('@')[0],
          userEmail: user.email,
          packageName: packageInfo.name,
          credits: packageInfo.credits,
          amount: parseFloat(order.payment_amount),
          buyerId: session.customer as string || 'N/A',
          alipayTradeNo: session.payment_intent as string || 'N/A',
          paidAt: new Date().toLocaleString('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        })
        
        if (adminEmailResult.success) {
          console.log('✅ 管理员订单通知邮件发送成功 (Stripe)')
        } else {
          console.error('❌ 管理员订单通知邮件发送失败 (Stripe):', adminEmailResult.error)
        }
      } catch (error) {
        console.error('❌ 发送管理员订单通知时出错 (Stripe):', error)
      }
    }

    // 处理payment_intent.succeeded事件（额外保障）
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      
      // 通过payment_intent_id查找订单
      const orderResult = await client.query(
        'SELECT id, status FROM credit_orders WHERE stripe_payment_intent_id = $1',
        [paymentIntent.id]
      )

      if (orderResult.rows.length > 0 && orderResult.rows[0].status !== 'COMPLETED') {
        console.log(`⚠️ 通过payment_intent补充处理订单: ${orderResult.rows[0].id}`)
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook处理失败:', error)
    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
