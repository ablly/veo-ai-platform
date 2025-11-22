import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { EmailService } from '@/lib/email'
import { logger } from '@/lib/logger'
import { verifyAlipaySignature, validatePaymentAmount, validateTradeStatus } from '@/lib/alipay-signature'

/**
 * 支付宝异步通知回调（兼容旧配置）
 * 这个接口与 /notify 完全相同，用于兼容支付宝开放平台配置为 /callback 的情况
 * 
 * GET /api/payment/alipay/callback - 支付宝验证URL可用性
 * POST /api/payment/alipay/callback - 支付宝异步通知
 */

// 处理支付宝的GET请求（验证URL可用性）
export async function GET(req: NextRequest) {
  console.log('📥 收到支付宝GET验证请求 (/callback)')
  return NextResponse.json({ success: true, message: 'Alipay callback endpoint is ready' })
}

export async function POST(req: NextRequest) {
  try {
    // 支付宝发送的是表单数据，不是JSON
    const text = await req.text()
    console.log('📥 收到支付宝回调原始数据 (/callback):', text)
    
    // 解析表单数据为对象
    const params = new URLSearchParams(text)
    const body: any = {}
    params.forEach((value, key) => {
      body[key] = value
    })
    
    console.log('📥 解析后的支付宝回调参数:', JSON.stringify(body, null, 2))
    
    // 1. 验证支付宝签名（必须！）
    console.log('🔐 开始验证支付宝签名...')
    const isValid = verifyAlipaySignature(body)
    if (!isValid) {
      console.error('❌ 支付宝签名验证失败，拒绝处理')
      console.error('❌ 回调参数:', JSON.stringify(body, null, 2))
      return NextResponse.json({ success: false, message: 'Invalid signature' }, { status: 400 })
    }
    console.log('✅ 支付宝签名验证通过')

    const {
      out_trade_no, // 订单号
      trade_no,     // 支付宝交易号
      trade_status, // 交易状态
      total_amount, // 支付金额
      buyer_id      // 买家支付宝用户ID
    } = body

    // 2. 验证交易状态
    console.log(`🔍 验证交易状态: ${trade_status}`)
    if (!validateTradeStatus(trade_status)) {
      console.log(`ℹ️ 交易状态不是成功状态: ${trade_status}，返回成功但不处理`)
      return NextResponse.json({ success: true, message: 'Trade not completed' })
    }
    console.log('✅ 交易状态验证通过')

    // 开始数据库事务
    const client = await pool.connect()
      
      try {
        await client.query('BEGIN')

        // 查询订单信息
        console.log(`🔍 查询订单: ${out_trade_no}`)
        const orderResult = await client.query(
          'SELECT * FROM credit_orders WHERE order_number = $1',
          [out_trade_no]
        )

        if (orderResult.rows.length === 0) {
          await client.query('ROLLBACK')
          console.error(`❌ 订单不存在: ${out_trade_no}`)
          return NextResponse.json({ success: false, message: 'Order not found' })
        }

        const order = orderResult.rows[0]
        console.log(`✅ 找到订单: ${out_trade_no}, 当前状态: ${order.status}`)

        // 3. 验证支付金额（关键！）
        const orderAmount = parseFloat(order.payment_amount)
        const paidAmount = parseFloat(total_amount)
        
        console.log(`💰 验证支付金额: 订单金额=${orderAmount}元, 实付金额=${paidAmount}元`)
        if (!validatePaymentAmount(orderAmount, paidAmount)) {
          await client.query('ROLLBACK')
          console.error(`❌ 支付金额不匹配: 订单${out_trade_no}, 订单金额${orderAmount}元, 实付${paidAmount}元`)
          return NextResponse.json({ success: false, message: 'Amount mismatch' }, { status: 400 })
        }
        console.log('✅ 支付金额验证通过')

        // 4. 检查订单是否已处理（幂等性）
        if (order.status === 'PAID' || order.status === 'COMPLETED') {
          await client.query('COMMIT')
          console.log(`✅ 订单已处理，跳过重复处理: ${out_trade_no}`)
          return NextResponse.json({ success: true, message: 'Already processed' })
        }
        
        console.log(`🚀 开始处理订单: ${out_trade_no}`)

        // 5. 更新订单状态为已支付
        console.log(`📝 更新订单状态为 PAID: ${out_trade_no}`)
        await client.query(
          `UPDATE credit_orders 
           SET status = 'PAID', 
               payment_time = NOW(),
               updated_at = NOW()
           WHERE order_number = $1`,
          [out_trade_no]
        )
        console.log('✅ 订单状态已更新')

        // 查询套餐信息以获取有效期
        const packageResult = await client.query(
          'SELECT id, name, credits FROM credit_packages WHERE id = $1',
          [order.package_id]
        )
        
        const packageInfo = packageResult.rows[0]
        
        // 计算过期时间（新手7天、基础30天、专业90天、企业180天）
        let validityDays = 30 // 默认30天
        if (packageInfo.name.includes('新手')) validityDays = 7
        if (packageInfo.name.includes('专业')) validityDays = 90
        if (packageInfo.name.includes('企业')) validityDays = 180
        
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + validityDays)

        // 给用户充值积分并设置过期时间
        console.log(`💎 开始充值积分: 用户ID=${order.user_id}, 积分=${packageInfo.credits}`)
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
          [order.user_id, packageInfo.credits, expiresAt, packageInfo.name]
        )
        console.log(`✅ 积分充值成功: ${packageInfo.credits}积分已到账`)

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
            packageInfo.credits,
            `购买${packageInfo.name}`,
            order.id
          ]
        )

        // 查询用户信息用于发送邮件
        const userResult = await client.query(
          'SELECT email, name FROM users WHERE id = $1',
          [order.user_id]
        )
        const user = userResult.rows[0]

        await client.query('COMMIT')

        // 发送购买成功邮件给用户（异步，不影响支付流程）
        EmailService.sendPurchaseSuccess({
          email: user.email,
          userName: user.name || user.email.split('@')[0],
          packageName: packageInfo.name,
          credits: packageInfo.credits,
          expiresAt: expiresAt.toLocaleDateString('zh-CN'),
          amount: parseFloat(order.payment_amount)
        }).catch(error => {
          logger.error('发送购买成功邮件失败', { error })
        })

        // 发送订单通知给管理员（异步，不影响支付流程）
        try {
          console.log('📧 开始发送管理员订单通知邮件...')
          console.log('📧 管理员邮箱:', process.env.ADMIN_EMAIL)
          
          const adminEmailResult = await EmailService.sendAdminOrderNotification({
            orderNumber: out_trade_no,
            userName: user.name || user.email.split('@')[0],
            userEmail: user.email,
            packageName: packageInfo.name,
            credits: packageInfo.credits,
            amount: parseFloat(order.payment_amount),
            buyerId: buyer_id || 'N/A',
            alipayTradeNo: trade_no,
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
            console.log('✅ 管理员订单通知邮件发送成功')
            logger.info('管理员订单通知邮件发送成功', { 
              context: {
                orderNumber: out_trade_no,
                messageId: adminEmailResult.messageId
              }
            })
          } else {
            console.error('❌ 管理员订单通知邮件发送失败:', adminEmailResult.error)
            logger.error('管理员订单通知邮件发送失败', { 
              error: new Error(adminEmailResult.error || 'Unknown error'),
              context: { orderNumber: out_trade_no }
            })
          }
        } catch (error) {
          console.error('❌ 发送管理员订单通知时出错:', error)
          logger.error('发送管理员订单通知时出错', { 
            error: error instanceof Error ? error : new Error(String(error)),
            context: { orderNumber: out_trade_no }
          })
        }

        // 记录详细的支付成功日志
        const paymentLog = {
          orderId: out_trade_no,
          alipayTradeNo: trade_no,
          userId: order.user_id,
          packageName: packageInfo.name,
          credits: packageInfo.credits,
          amount: paidAmount,
          expiresAt: expiresAt.toISOString(),
          buyerId: buyer_id,
          processedAt: new Date().toISOString(),
          callbackUrl: '/callback'
        }

        logger.info('✅ 支付成功处理完成 (/callback)', { context: paymentLog })
        console.log('✅ 支付处理成功 (/callback):', JSON.stringify(paymentLog, null, 2))

        return NextResponse.json({ success: true, message: 'Payment processed successfully' })

      } catch (error) {
        await client.query('ROLLBACK')
        console.error('处理支付回调失败 (/callback):', error)
        return NextResponse.json({ success: false, message: 'Processing failed' })
      } finally {
        client.release()
      }

  } catch (error) {
    console.error('支付宝回调处理失败 (/callback):', error)
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 })
  }
}
