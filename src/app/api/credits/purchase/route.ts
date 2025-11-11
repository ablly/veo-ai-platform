import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { sendPurchaseConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  const client = await pool.connect()
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未授权访问" }, { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json({ error: "套餐ID不能为空" }, { status: 400 })
    }

    // 开始事务
    await client.query('BEGIN')

    // 1. 获取套餐信息
    const packageResult = await client.query(
      `SELECT id, name, credits, price, is_active 
       FROM credit_packages 
       WHERE id = $1`,
      [packageId]
    )

    if (packageResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: "套餐不存在" }, { status: 404 })
    }

    const pkg = packageResult.rows[0]

    if (!pkg.is_active) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: "该套餐已下架" }, { status: 400 })
    }

    // 2. 创建订单（简化版，生产环境应接入支付网关）
    const orderResult = await client.query(
      `INSERT INTO credit_orders 
        (user_id, package_id, credits_amount, payment_amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id`,
      [userId, packageId, pkg.credits, pkg.price, 'PENDING']
    )

    const orderId = orderResult.rows[0].id

    // 3. 模拟支付成功（生产环境应等待支付回调）
    // 在生产环境中，这部分应该在支付回调中处理
    await client.query(
      `UPDATE credit_orders 
       SET status = 'COMPLETED', 
           payment_time = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    )

    // 4. 获取当前积分余额
    const balanceResult = await client.query(
      `SELECT available_credits 
       FROM user_credit_accounts 
       WHERE user_id = $1`,
      [userId]
    )

    const currentBalance = balanceResult.rows[0]?.available_credits || 0

    // 5. 增加用户积分
    await client.query(
      `UPDATE user_credit_accounts 
       SET total_credits = total_credits + $1,
           available_credits = available_credits + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [pkg.credits, userId]
    )

    // 6. 记录积分交易
    await client.query(
      `INSERT INTO credit_transactions 
        (user_id, transaction_type, credit_amount, balance_before, balance_after, description, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        userId,
        'PURCHASE',
        pkg.credits,
        currentBalance,
        currentBalance + pkg.credits,
        `购买${pkg.name}，订单号：${orderId}`
      ]
    )

    // 提交事务
    await client.query('COMMIT')

    // 发送购买确认邮件
    try {
      const userResult = await client.query(
        'SELECT email, name FROM users WHERE id = $1',
        [userId]
      )
      
      if (userResult.rows.length > 0) {
        const user = userResult.rows[0]
        await sendPurchaseConfirmationEmail(user.email, {
          orderId: orderId,
          packageName: pkg.name,
          credits: pkg.credits,
          amount: pkg.price
        })
      }
    } catch (emailError) {
      console.error("购买确认邮件发送失败:", emailError)
      // 邮件发送失败不影响购买流程
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      credits: pkg.credits,
      message: '购买成功'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error("购买积分失败:", error)
    return NextResponse.json(
      { error: "购买积分失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

