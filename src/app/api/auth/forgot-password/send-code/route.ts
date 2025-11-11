import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { EmailService } from "@/lib/email"
import { logger } from "@/lib/logger"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: "邮箱地址不能为空" },
        { status: 400 }
      )
    }

    logger.info('收到重置密码验证码请求', { email })

    const client = await pool.connect()

    try {
      // 1. 验证邮箱是否存在
      const userCheck = await client.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [email]
      )

      if (userCheck.rows.length === 0) {
        logger.warn('尝试重置不存在的邮箱密码', { email })
        return NextResponse.json(
          { error: "该邮箱未注册" },
          { status: 404 }
        )
      }

      const user = userCheck.rows[0]

      // 2. 生成6位数字验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期

      logger.info('生成重置密码验证码', { email, code, expiresAt })

      // 3. 保存验证码到数据库（使用相同的email_verification_codes表）
      await client.query(
        `INSERT INTO email_verification_codes (email, code, expires_at, created_at, used) 
         VALUES ($1, $2, $3, NOW(), false)`,
        [email, code, expiresAt]
      )

      // 4. 发送验证码邮件（使用重置密码模板）
      logger.info('开始发送重置密码邮件', { email, code })

      const result = await EmailService.sendPasswordResetCode({
        to: email,
        code,
        userName: user.name || '用户',
      })

      logger.info('重置密码邮件发送结果', { email, result })

      // 开发环境返回验证码
      const isDev = process.env.NODE_ENV === 'development'

      return NextResponse.json({
        success: true,
        message: "验证码已发送到您的邮箱，请查收",
        devCode: isDev ? code : undefined, // 仅开发环境返回
      })

    } catch (error) {
      logger.error("发送重置密码验证码失败", { 
        error: error instanceof Error ? error : new Error(String(error)), 
        email 
      })
      
      return NextResponse.json(
        { error: "发送验证码失败，请稍后重试" },
        { status: 500 }
      )
    } finally {
      client.release()
    }

  } catch (error) {
    logger.error("重置密码验证码请求处理失败", { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    )
  }
}


