import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { PRODUCTION_CONFIG } from "@/config/production"

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json({ error: "手机号和验证码不能为空" }, { status: 400 })
    }

    await client.query('BEGIN')

    // 验证验证码
    const codeResult = await client.query(
      `SELECT * FROM phone_verification_codes 
       WHERE phone = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone, code]
    )

    if (codeResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ 
        error: "验证码无效或已过期" 
      }, { status: 400 })
    }

    const verificationRecord = codeResult.rows[0]

    // 标记验证码为已使用
    await client.query(
      'UPDATE phone_verification_codes SET used = true WHERE id = $1',
      [verificationRecord.id]
    )

    // 查找或创建用户
    let userResult = await client.query(
      'SELECT * FROM users WHERE phone = $1',
      [phone]
    )

    let user
    if (userResult.rows.length === 0) {
      // 创建新用户
      const newUserResult = await client.query(
        `INSERT INTO users (phone, name, created_at) 
         VALUES ($1, $2, NOW()) RETURNING *`,
        [phone, `用户${phone.slice(-4)}`]
      )
      user = newUserResult.rows[0]

      // 给新用户赠送积分
      await client.query(
        `INSERT INTO user_credits (user_id, balance, created_at, updated_at)
         VALUES ($1, $2, NOW(), NOW())`,
        [user.id, PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS]
      )

      // 记录积分交易
      await client.query(
        `INSERT INTO credit_transactions (user_id, type, amount, description, created_at)
         VALUES ($1, 'BONUS', $2, '新用户注册奖励', NOW())`,
        [user.id, PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS]
      )

      console.log(`✅ 新用户通过手机号注册: ${phone}, 赠送积分: ${PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS}`)
    } else {
      user = userResult.rows[0]
      console.log(`✅ 用户通过手机号登录: ${phone}`)
    }

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: "验证成功",
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error("验证手机验证码失败:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}



