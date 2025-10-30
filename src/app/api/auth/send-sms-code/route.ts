import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendSMS, isValidChinesePhone, formatPhoneNumber } from "@/lib/sms-twilio"
import { PRODUCTION_CONFIG } from "@/config/production"

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "手机号不能为空" }, { status: 400 })
    }

    // 验证手机号格式
    if (!isValidChinesePhone(phone)) {
      return NextResponse.json({ error: "请输入正确的手机号格式" }, { status: 400 })
    }

    // 获取客户端信息
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // 检查发送频率限制（同一手机号1分钟内只能发送一次）
    const recentCode = await client.query(
      `SELECT created_at FROM phone_verification_codes 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    )

    if (recentCode.rows.length > 0) {
      return NextResponse.json({ 
        error: "验证码发送过于频繁，请1分钟后再试" 
      }, { status: 429 })
    }

    // 检查同一IP的发送频率（防止恶意刷验证码）
    const recentIPCode = await client.query(
      `SELECT created_at FROM phone_verification_codes 
       WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [ip]
    )

    if (recentIPCode.rows.length > 0) {
      return NextResponse.json({ 
        error: "发送过于频繁，请稍后再试" 
      }, { status: 429 })
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 验证码有效期（从配置获取）
    const expiresAt = new Date(Date.now() + PRODUCTION_CONFIG.CREDITS.EMAIL_VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000)

    // 清除该手机号之前未使用的验证码
    await client.query(
      'DELETE FROM phone_verification_codes WHERE phone = $1 AND used = false',
      [phone]
    )

    // 存储验证码到数据库
    await client.query(
      `INSERT INTO phone_verification_codes (phone, code, expires_at, created_at, ip_address, user_agent)
       VALUES ($1, $2, $3, NOW(), $4, $5)`,
      [phone, code, expiresAt, ip, userAgent]
    )

    // 发送短信验证码
    const formattedPhone = formatPhoneNumber(phone)
    const smsSuccess = await sendSMS(formattedPhone, code)

    if (!smsSuccess) {
      // 如果短信发送失败，删除刚才插入的验证码记录
      await client.query(
        'DELETE FROM phone_verification_codes WHERE phone = $1 AND code = $2',
        [phone, code]
      )
      
      return NextResponse.json(
        { error: "短信发送失败，请检查手机号或稍后重试" },
        { status: 500 }
      )
    }

    console.log(`✅ 验证码已发送至手机号: ${phone}`)
    
    return NextResponse.json({
      success: true,
      message: "验证码已发送，请查收短信",
      // 开发环境下返回验证码（生产环境不返回）
      ...(process.env.NODE_ENV === 'development' && { devCode: code })
    })
  } catch (error) {
    console.error("发送短信验证码失败:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}













