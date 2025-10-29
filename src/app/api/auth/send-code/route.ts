import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { logger } from "@/lib/logger"

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const { email } = await request.json()
    
    logger.info('收到发送验证码请求', { email })

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

    // 检查用户是否存在，如果不存在则自动创建
    let userResult = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      // 自动注册新用户
      const newUserResult = await client.query(
        `INSERT INTO users (email, name, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())
         RETURNING id, email`,
        [email, email.split('@')[0]]  // 使用邮箱前缀作为默认用户名
      )
      
      const newUser = newUserResult.rows[0]
      
      // 给新用户初始化积分账户
      await client.query(
        `INSERT INTO user_credit_accounts (user_id, available_credits, total_credits, used_credits, frozen_credits, created_at, updated_at)
         VALUES ($1, 0, 0, 0, 0, NOW(), NOW())`,
        [newUser.id]
      )
      
      console.log(`✅ 新用户自动注册: ${email}`)
      userResult = newUserResult
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // 验证码有效期5分钟
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    
    logger.info('生成验证码', { email, code, expiresAt })

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
      logger.info('开始发送邮件', { email, code })
      const result = await sendVerificationEmail(email, code)
      
      logger.info('邮件发送结果', { email, result })
      
      return NextResponse.json({
        success: true,
        message: "验证码已发送到您的邮箱，请查收"
      })
    } catch (emailError) {
      logger.error("邮件发送失败", { 
        error: emailError instanceof Error ? emailError : new Error(String(emailError)),
        email 
      })
      return NextResponse.json(
        { success: false, error: "验证码发送失败，请检查邮箱地址或稍后重试" },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error("发送验证码失败", { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
