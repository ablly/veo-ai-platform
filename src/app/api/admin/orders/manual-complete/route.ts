import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'
import { EmailService } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * 手动完成订单（管理员补单）
 * POST /api/admin/orders/manual-complete
 */
export async function POST(req: NextRequest) {
  try {
    // 验证管理员权限
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (session.user.email !== adminEmail) {
      return NextResponse.json({ success: false, message: '无权限' }, { status: 403 })
    }

    const { orderNumber, reason } = await req.json()

    if (!orderNumber) {
      return NextResponse.json({ success: false, message: '缺少订单号' }, { status: 400 })
    }

    console.log(`🔧 管理员手动补单: ${orderNumber}, 原因: ${reason || '无'}`)

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      // 查询订单信息
      const orderResult = await client.query(
        `SELECT co.*, cp.name as package_name, cp.credits, u.email, u.name as user_name
         FROM credit_orders co
         JOIN credit_packages cp ON co.package_id = cp.id
         JOIN users u ON co.user_id = u.id
         WHERE co.order_number = $1`,
        [orderNumber]
      )

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ success: false, message: '订单不存在' }, { status: 404 })
      }

      const order = orderResult.rows[0]

      // 检查订单是否已完成
      if (order.status === 'PAID' || order.status === 'COMPLETED') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '订单已完成，无需重复处理' 
        }, { status: 400 })
      }

      console.log(`📦 订单信息: 用户=${order.email}, 套餐=${order.package_name}, 积分=${order.credits}`)

      // 更新订单状态
      await client.query(
        `UPDATE credit_orders 
         SET status = 'PAID',
             payment_time = NOW(),
             updated_at = NOW()
         WHERE order_number = $1`,
        [orderNumber]
      )

      console.log('✅ 订单状态已更新为 PAID')

      // 计算过期时间
      let validityDays = 30
      if (order.package_name.includes('新手')) validityDays = 7
      if (order.package_name.includes('专业')) validityDays = 90
      if (order.package_name.includes('企业')) validityDays = 180

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)

      // 充值积分
      console.log(`💎 开始充值积分: 用户ID=${order.user_id}, 积分=${order.credits}`)
      await client.query(
        `INSERT INTO user_credit_accounts (
          user_id, available_credits, total_credits, used_credits, frozen_credits,
          package_expires_at, is_expired, package_name,
          created_at, updated_at
        )
         VALUES ($1, $2, $2, 0, 0, $3, false, $4, NOW(), NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           available_credits = user_credit_accounts.available_credits + $2,
           total_credits = user_credit_accounts.total_credits + $2,
           package_expires_at = $3,
           is_expired = false,
           package_name = $4,
           updated_at = NOW()`,
        [order.user_id, order.credits, expiresAt, order.package_name]
      )

      console.log(`✅ 积分充值成功: ${order.credits}积分已到账`)

      // 记录积分变动
      await client.query(
        `INSERT INTO credit_transactions (
          user_id, transaction_type, credit_amount, description,
          balance_before, balance_after,
          related_order_id, created_at
        )
        SELECT
          $1, 'PURCHASE', $2, $3,
          COALESCE(uca.available_credits, 0) - $2,
          COALESCE(uca.available_credits, 0),
          $4, NOW()
        FROM user_credit_accounts uca
        WHERE uca.user_id = $1`,
        [
          order.user_id,
          order.credits,
          `手动补单: ${order.package_name} (原因: ${reason || '管理员操作'})`,
          order.id
        ]
      )

      await client.query('COMMIT')

      // 发送购买成功邮件给用户（异步）
      EmailService.sendPurchaseSuccess({
        email: order.email,
        userName: order.user_name || order.email.split('@')[0],
        packageName: order.package_name,
        credits: order.credits,
        expiresAt: expiresAt.toLocaleDateString('zh-CN'),
        amount: parseFloat(order.payment_amount)
      }).catch(error => {
        logger.error('发送购买成功邮件失败', { error })
      })

      // 记录管理员操作日志
      logger.info('管理员手动补单成功', {
        context: {
          orderNumber,
          userId: order.user_id,
          userEmail: order.email,
          credits: order.credits,
          reason: reason || '无',
          adminEmail: session.user.email
        }
      })

      console.log(`✅ 手动补单完成: 订单${orderNumber}, 用户${order.email}已获得${order.credits}积分`)

      return NextResponse.json({
        success: true,
        message: '补单成功',
        order: {
          orderNumber,
          userEmail: order.email,
          packageName: order.package_name,
          credits: order.credits,
          expiresAt: expiresAt.toISOString()
        }
      })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('手动补单失败:', error)
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('手动补单接口错误:', error)
    logger.error('手动补单失败', { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    return NextResponse.json(
      { success: false, message: '补单失败' },
      { status: 500 }
    )
  }
}
