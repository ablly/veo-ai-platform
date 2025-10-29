import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

/**
 * 创建支付宝订单（生产环境）
 * POST /api/payment/alipay/create-order
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    const { packageId } = await req.json()
    
    if (!packageId) {
      return NextResponse.json({ success: false, message: '缺少套餐ID' }, { status: 400 })
    }

    // 防止重复提交（简单的请求频率限制）
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    // TODO: 集成Redis实现更完善的频率限制
    console.log(`创建订单请求来自: ${clientIp}`)

    // 查询用户ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [session.user.email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: '用户不存在' }, { status: 404 })
    }

    const userId = userResult.rows[0].id

    // 查询套餐信息
    const packageResult = await pool.query(
      'SELECT * FROM credit_packages WHERE id = $1 AND is_active = true',
      [packageId]
    )

    if (packageResult.rows.length === 0) {
      return NextResponse.json({ success: false, message: '套餐不存在或已下架' }, { status: 404 })
    }

    const pkg = packageResult.rows[0]

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 检查是否存在未支付的订单（防重复下单）
      const existingOrderResult = await client.query(
        `SELECT order_number, id FROM credit_orders 
         WHERE user_id = $1 AND package_id = $2 AND status = 'PENDING' 
         AND created_at > NOW() - INTERVAL '30 minutes'
         LIMIT 1`,
        [userId, pkg.id]
      )

      let orderId: string
      let dbOrderId: string

      if (existingOrderResult.rows.length > 0) {
        // 重用已有未支付订单
        orderId = existingOrderResult.rows[0].order_number
        dbOrderId = existingOrderResult.rows[0].id
        console.log(`重用未支付订单: ${orderId}`)
      } else {
        // 创建新订单
        orderId = `VEO${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`
        dbOrderId = uuidv4()
        
        await client.query(
          `INSERT INTO credit_orders (
            id, order_number, user_id, package_id, package_name, 
            credits, amount, payment_method, status, created_at, expires_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW() + INTERVAL '30 minutes')`,
          [
            dbOrderId,
            orderId,
            userId,
            pkg.id,
            pkg.name,
            pkg.credits,
            pkg.price,
            'ALIPAY',
            'PENDING'
          ]
        )
      }

      await client.query('COMMIT')

      // 调用支付宝SDK生成支付链接
      const paymentResult = await createAlipayPayment({
        outTradeNo: orderId,
        totalAmount: pkg.price,
        subject: pkg.name,
        body: `购买${pkg.name} - ${pkg.credits}积分`
      })

      if (!paymentResult.success) {
        return NextResponse.json({
          success: false,
          message: paymentResult.message || '创建支付失败'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        orderId,
        orderNumber: orderId,
        amount: pkg.price,
        paymentUrl: paymentResult.paymentUrl,
        qrCode: paymentResult.qrCode,
        message: '订单创建成功，请完成支付'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('创建支付宝订单失败:', error)
    return NextResponse.json(
      { success: false, message: '创建订单失败' },
      { status: 500 }
    )
  }
}

/**
 * 调用支付宝创建支付（生产环境）
 */
async function createAlipayPayment(params: {
  outTradeNo: string
  totalAmount: number
  subject: string
  body: string
}) {
  try {
    const ALIPAY_APP_ID = process.env.ALIPAY_APP_ID
    const ALIPAY_PRIVATE_KEY = process.env.ALIPAY_PRIVATE_KEY
    const ALIPAY_GATEWAY = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do'
    const NOTIFY_URL = process.env.NEXTAUTH_URL + '/api/payment/alipay/notify'
    const RETURN_URL = process.env.NEXTAUTH_URL + '/credits'

    if (!ALIPAY_APP_ID || !ALIPAY_PRIVATE_KEY) {
      console.error('❌ 支付宝配置缺失！请在.env中配置 ALIPAY_APP_ID 和 ALIPAY_PRIVATE_KEY')
      return {
        success: false,
        message: '支付配置错误'
      }
    }

    // 构建支付请求参数
    const bizContent = {
      out_trade_no: params.outTradeNo,
      total_amount: params.totalAmount.toFixed(2),
      subject: params.subject,
      body: params.body,
      product_code: 'FAST_INSTANT_TRADE_PAY', // 即时到账
      timeout_express: '30m' // 30分钟超时
    }

    const commonParams = {
      app_id: ALIPAY_APP_ID,
      method: 'alipay.trade.page.pay', // 电脑网站支付
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      version: '1.0',
      notify_url: NOTIFY_URL,
      return_url: RETURN_URL,
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

    // 构建支付URL
    const paymentParams = new URLSearchParams({
      ...commonParams,
      sign
    })

    const paymentUrl = `${ALIPAY_GATEWAY}?${paymentParams.toString()}`

    return {
      success: true,
      paymentUrl,
      qrCode: null // PC网站支付不需要二维码，移动端支付可以生成二维码
    }

  } catch (error) {
    console.error('❌ 创建支付宝支付失败:', error)
    return {
      success: false,
      message: '创建支付失败'
    }
  }
}
