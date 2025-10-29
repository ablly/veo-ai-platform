import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { EmailService } from '@/lib/email'
import { logger } from '@/lib/logger'

/**
 * 支付宝异步通知回调
 * POST /api/payment/alipay/notify
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // TODO: 验证支付宝签名
    // const isValid = verifyAlipaySignature(body)
    // if (!isValid) {
    //   return NextResponse.json({ success: false, message: 'Invalid signature' })
    // }

    const {
      out_trade_no, // 订单号
      trade_no,     // 支付宝交易号
      trade_status, // 交易状态
      total_amount, // 支付金额
      buyer_id      // 买家支付宝用户ID
    } = body

    if (trade_status === 'TRADE_SUCCESS' || trade_status === 'TRADE_FINISHED') {
      // 开始数据库事务
      const client = await pool.connect()
      
      try {
        await client.query('BEGIN')

        // 查询订单信息
        const orderResult = await client.query(
          'SELECT * FROM credit_orders WHERE order_number = $1',
          [out_trade_no]
        )

        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK')
          return NextResponse.json({ success: false, message: 'Order not found' })
        }

        const order = orderResult.rows[0]

        // 检查订单是否已处理
        if (order.status === 'PAID') {
          await client.query('COMMIT')
          return NextResponse.json({ success: true, message: 'Already processed' })
        }

        // 更新订单状态
        await client.query(
          `UPDATE credit_orders 
           SET status = 'PAID', 
               paid_at = NOW(), 
               transaction_id = $1,
               updated_at = NOW()
           WHERE order_number = $2`,
          [trade_no, out_trade_no]
        )

        // 查询套餐信息以获取有效期
        const packageResult = await client.query(
          'SELECT id, name, credits FROM credit_packages WHERE id = $1',
          [order.package_id]
        )
        
        const packageInfo = packageResult.rows[0]
        
        // 计算过期时间（基础30天、专业90天、企业365天）
        let validityDays = 30 // 默认30天
        if (packageInfo.name.includes('专业')) validityDays = 90
        if (packageInfo.name.includes('企业')) validityDays = 365
        
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + validityDays)

        // 给用户充值积分并设置过期时间
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
          [order.user_id, order.credits, expiresAt, packageInfo.name]
        )

        // 记录积分变动
        await client.query(
          `INSERT INTO credit_transactions (
            user_id, type, amount, description, 
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
            `购买${order.package_name}`,
            order.id
          ]
        )

        // 移除VivaAPI密钥生成（改用统一的速创API）
        // await generateVivaApiKey(order.user_id, order.package_id, order.credits)

        // 查询用户信息用于发送邮件
        const userResult = await client.query(
          'SELECT email, name FROM users WHERE id = $1',
          [order.user_id]
        )
        const user = userResult.rows[0]

        await client.query('COMMIT')

        // 发送购买成功邮件（异步，不影响支付流程）
        EmailService.sendPurchaseSuccess({
          email: user.email,
          userName: user.name || user.email.split('@')[0],
          packageName: packageInfo.name,
          credits: order.credits,
          expiresAt: expiresAt.toLocaleDateString('zh-CN'),
          amount: parseFloat(order.amount)
        }).catch(error => {
          logger.error('发送购买成功邮件失败', { error })
        })

        logger.info('支付成功处理完成', {
          context: {
            userId: order.user_id,
            packageName: packageInfo.name,
            credits: order.credits,
            expiresAt: expiresAt.toISOString()
          }
        })

        return NextResponse.json({ success: true, message: 'Payment processed' })

      } catch (error) {
        await client.query('ROLLBACK')
        console.error('处理支付回调失败:', error)
        return NextResponse.json({ success: false, message: 'Processing failed' })
      } finally {
        client.release()
      }
    }

    return NextResponse.json({ success: true, message: 'Notification received' })

  } catch (error) {
    console.error('支付宝回调处理失败:', error)
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 })
  }
}

/**
 * 注意：已移除VivaAPI密钥生成
 * 改用统一的速创API，不需要为每个用户单独生成API密钥
 * 所有用户共享同一个速创API密钥（在环境变量中配置）
 */
