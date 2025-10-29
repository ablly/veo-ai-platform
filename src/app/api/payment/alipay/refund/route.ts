import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'
import crypto from 'crypto'

/**
 * 支付宝退款API（生产环境）
 * POST /api/payment/alipay/refund
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: 添加管理员权限验证
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const { orderId, refundReason } = body

    if (!orderId) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少订单ID' 
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 查询订单
      const orderResult = await client.query(
        'SELECT * FROM credit_orders WHERE id = $1 FOR UPDATE',
        [orderId]
      )

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '订单不存在' 
        }, { status: 404 })
      }

      const order = orderResult.rows[0]

      // 检查订单状态
      if (order.status !== 'PAID') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '只能退款已支付的订单' 
        }, { status: 400 })
      }

      // 检查是否已经退款
      if (order.refund_status === 'REFUNDED') {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '此订单已退款' 
        }, { status: 400 })
      }

      // 调用支付宝退款接口
      const alipayRefundResult = await callAlipayRefund({
        outTradeNo: order.id,
        refundAmount: order.amount,
        refundReason: refundReason || '用户申请退款'
      })

      if (!alipayRefundResult.success) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: `退款失败: ${alipayRefundResult.message}` 
        }, { status: 500 })
      }

      // 扣减用户积分（如果已使用则不能全额退款）
      const userCreditResult = await client.query(
        'SELECT * FROM user_credit_accounts WHERE user_id = $1',
        [order.user_id]
      )

      if (userCreditResult.rows.length > 0) {
        const creditAccount = userCreditResult.rows[0]
        
        // 如果用户积分足够扣除
        if (creditAccount.available_credits >= order.credits) {
          await client.query(
            `UPDATE user_credit_accounts 
             SET available_credits = available_credits - $1,
                 total_credits = total_credits - $1,
                 updated_at = NOW()
             WHERE user_id = $2`,
            [order.credits, order.user_id]
          )

          // 记录积分变动
          await client.query(
            `INSERT INTO credit_transactions (
              user_id, transaction_type, credit_amount, description, 
              balance_before, balance_after, created_at
            ) VALUES ($1, 'REFUND', $2, $3, $4, $5, NOW())`,
            [
              order.user_id,
              -order.credits,
              `退款扣除: 订单${order.id}`,
              creditAccount.available_credits,
              creditAccount.available_credits - order.credits
            ]
          )
        } else {
          // 积分不足，部分退款或拒绝退款
          await client.query('ROLLBACK')
          return NextResponse.json({ 
            success: false, 
            message: '退款失败：用户积分不足，可能已被使用' 
          }, { status: 400 })
        }
      }

      // 更新订单状态
      await client.query(
        `UPDATE credit_orders 
         SET refund_status = 'REFUNDED',
             refund_at = NOW(),
             refund_reason = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [refundReason, orderId]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: '退款成功',
        refundAmount: order.amount
      })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('退款处理失败:', error)
      return NextResponse.json({
        success: false,
        message: '退款处理失败'
      }, { status: 500 })
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('退款API错误:', error)
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}

/**
 * 调用支付宝退款接口
 */
async function callAlipayRefund(params: {
  outTradeNo: string
  refundAmount: number
  refundReason: string
}) {
  try {
    const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID
    const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY
    const ALIPAY_GATEWAY = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do'

    if (!ALIPAY_APP_ID || !ALIPAY_PRIVATE_KEY) {
      throw new Error('支付宝配置缺失')
    }

    // 构建退款请求参数
    const bizContent = {
      out_trade_no: params.outTradeNo,
      refund_amount: params.refundAmount.toFixed(2),
      refund_reason: params.refundReason
    }

    const commonParams = {
      app_id: ALIPAY_APP_ID,
      method: 'alipay.trade.refund',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    }

    // 生成签名
    const signString = Object.keys(commonParams)
      .sort()
      .map(key => `${key}=${(commonParams as any)[key]}`)
      .join('&')

    const sign = crypto
      .createSign('RSA-SHA256')
      .update(signString)
      .sign(ALIPAY_PRIVATE_KEY, 'base64')

    // 发起请求
    const requestParams = new URLSearchParams({
      ...commonParams,
      sign
    })

    const response = await fetch(ALIPAY_GATEWAY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: requestParams
    })

    const result = await response.json()

    // 检查退款结果
    if (result.alipay_trade_refund_response?.code === '10000') {
      return {
        success: true,
        message: '退款成功',
        data: result.alipay_trade_refund_response
      }
    } else {
      return {
        success: false,
        message: result.alipay_trade_refund_response?.sub_msg || '退款失败'
      }
    }

  } catch (error) {
    console.error('调用支付宝退款接口失败:', error)
    return {
      success: false,
      message: '退款接口调用失败'
    }
  }
}



