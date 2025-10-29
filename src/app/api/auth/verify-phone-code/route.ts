import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"
import { CREDIT_CONFIG } from "@/config/credits"

const verifyPhoneCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
  code: z.string().length(6, "验证码必须是6位数字"),
})

export async function POST(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const body = await req.json()
    const { phone, code } = verifyPhoneCodeSchema.parse(body)

    await client.query('BEGIN')

    // 1. 验证验证码
    const codeResult = await client.query(
      `SELECT * FROM phone_verification_codes 
       WHERE phone = $1 AND code = $2 AND expires_at > NOW() AND used = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    )

    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      )
    }

    // 2. 标记验证码为已使用
    await client.query(
      `UPDATE phone_verification_codes SET used = TRUE WHERE id = $1`,
      [codeResult.rows[0].id]
    )

    // 3. 查找或创建用户
    let userResult = await client.query(
      'SELECT id, phone, name, avatar FROM users WHERE phone = $1',
      [phone]
    )

    let user
    if (userResult.rows.length === 0) {
      // 创建新用户
      const newUserResult = await client.query(
        `INSERT INTO users (phone, name, created_at, updated_at) 
         VALUES ($1, $2, NOW(), NOW()) 
         RETURNING id, phone, name, avatar`,
        [phone, `用户${phone.slice(-4)}`] // 默认用户名
      )
      
      user = newUserResult.rows[0]

      // 给新用户赠送积分
      const bonusCredits = CREDIT_CONFIG.NEW_USER_BONUS
      await client.query(
        `INSERT INTO user_credit_accounts 
         (user_id, total_credits, available_credits, used_credits, frozen_credits, created_at, updated_at) 
         VALUES ($1, $2, $2, 0, 0, NOW(), NOW())`,
        [user.id, bonusCredits]
      )

      // 记录积分交易
      await client.query(
        `INSERT INTO credit_transactions 
         (user_id, transaction_type, credit_amount, balance_before, balance_after, description, created_at) 
         VALUES ($1, 'BONUS', $2, 0, $2, '新用户注册赠送 - 可体验视频生成', NOW())`,
        [user.id, bonusCredits]
      )

      console.log(`✅ 新用户通过手机号注册: ${phone}, 赠送积分: ${bonusCredits}`)
    } else {
      user = userResult.rows[0]
      console.log(`✅ 用户通过手机号登录: ${phone}`)
    }

    await client.query('COMMIT')

    // 记录日志
    await logger.info("手机验证码登录成功", {
      phone,
      userId: user.id,
      isNewUser: userResult.rows.length === 0,
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatar: user.avatar,
      },
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error("手机验证码登录失败:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "登录失败" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}