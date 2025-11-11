import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import { logger } from "@/lib/logger"

const resetPasswordSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  code: z.string().length(6, "验证码必须是6位数字"),
  newPassword: z.string().min(6, "密码至少需要6个字符"),
})

export async function POST(req: NextRequest) {
  let client;
  
  try {
    const body = await req.json()
    const { email, code, newPassword } = resetPasswordSchema.parse(body)

    logger.info('收到重置密码请求', { email })

    client = await pool.connect()
    
    // 开始事务
    await client.query('BEGIN')

    try {
      // 1. 验证邮箱是否存在
      const userCheck = await client.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email]
      )

      if (userCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        logger.warn('尝试重置不存在用户的密码', { email })
        return NextResponse.json(
          { error: "用户不存在" },
          { status: 404 }
        )
      }

      const user = userCheck.rows[0]

      // 2. 验证验证码
      const codeCheck = await client.query(
        `SELECT id, code, expires_at, used 
         FROM email_verification_codes 
         WHERE email = $1 AND code = $2 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [email, code]
      )

      if (codeCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        logger.warn('验证码不存在', { email, code })
        return NextResponse.json(
          { error: "验证码无效" },
          { status: 400 }
        )
      }

      const verificationCode = codeCheck.rows[0]

      // 3. 检查验证码是否已使用
      if (verificationCode.used) {
        await client.query('ROLLBACK')
        logger.warn('验证码已被使用', { email, code })
        return NextResponse.json(
          { error: "验证码已被使用" },
          { status: 400 }
        )
      }

      // 4. 检查验证码是否过期
      const now = new Date()
      const expiresAt = new Date(verificationCode.expires_at)
      
      if (now > expiresAt) {
        await client.query('ROLLBACK')
        logger.warn('验证码已过期', { email, code, expiresAt })
        return NextResponse.json(
          { error: "验证码已过期，请重新获取" },
          { status: 400 }
        )
      }

      // 5. 加密新密码
      const hashedPassword = await bcryptjs.hash(newPassword, 12)
      logger.info('密码加密完成', { email })

      // 6. 更新用户密码
      await client.query(
        `UPDATE users 
         SET password = $1, updated_at = NOW() 
         WHERE id = $2`,
        [hashedPassword, user.id]
      )

      logger.info('用户密码更新成功', { email, userId: user.id })

      // 7. 标记验证码为已使用
      await client.query(
        `UPDATE email_verification_codes 
         SET used = true 
         WHERE id = $1`,
        [verificationCode.id]
      )

      // 8. 使该用户的所有其他验证码失效（安全措施）
      await client.query(
        `UPDATE email_verification_codes 
         SET used = true 
         WHERE email = $1 AND id != $2 AND used = false`,
        [email, verificationCode.id]
      )

      // 提交事务
      await client.query('COMMIT')

      logger.info('密码重置成功', { email, userId: user.id })

      return NextResponse.json({
        success: true,
        message: "密码重置成功，请使用新密码登录",
      })

    } catch (dbError) {
      await client.query('ROLLBACK')
      logger.error("数据库操作失败", { 
        error: dbError instanceof Error ? dbError : new Error(String(dbError)),
        email 
      })
      
      return NextResponse.json(
        { error: "重置密码失败，请稍后重试" },
        { status: 500 }
      )
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("重置密码数据验证失败", { errors: error.issues })
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    logger.error("重置密码请求处理失败", { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    
    return NextResponse.json(
      { error: "服务器错误，请稍后重试" },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}


