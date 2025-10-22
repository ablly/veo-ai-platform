import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { PRODUCTION_CONFIG } from "@/config/production"

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "邮箱地址不能为空" },
        { status: 400 }
      )
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "邮箱格式不正确" },
        { status: 400 }
      )
    }

    // 检查用户是否存在
    const userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "该邮箱尚未注册" },
        { status: 404 }
      )
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 验证码有效期（从配置获取）
    const expiresAt = new Date(Date.now() + PRODUCTION_CONFIG.VERIFICATION_CODE.EXPIRY_MINUTES * 60 * 1000)

    // 清除该邮箱之前未使用的验证码
    await client.query(
      'DELETE FROM email_verification_codes WHERE email = $1 AND used = false',
      [email]
    )

    // 保存验证码到数据库
    await client.query(
      `INSERT INTO email_verification_codes (email, code, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [email, code, expiresAt]
    )

    // 发送验证码邮件
    try {
      await sendVerificationEmail(email, code)
      
      return NextResponse.json({
        success: true,
        message: "验证码已发送到您的邮箱，请查收"
      })
    } catch (emailError) {
      console.error("❌ 邮件发送失败:", emailError)
      return NextResponse.json(
        { error: "验证码发送失败，请检查邮箱地址或稍后重试" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("发送验证码失败:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
