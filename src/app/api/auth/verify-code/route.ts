import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: Request) {
  const client = await pool.connect()
  
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "邮箱和验证码不能为空" },
        { status: 400 }
      )
    }

    // 查找有效的验证码
    const codeResult = await client.query(
      `SELECT id, email, code, expires_at, used 
       FROM email_verification_codes 
       WHERE email = $1 AND code = $2 AND used = false
       ORDER BY created_at DESC 
       LIMIT 1`,
      [email, code]
    )

    if (codeResult.rows.length === 0) {
      return NextResponse.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      )
    }

    const verificationCode = codeResult.rows[0]

    // 检查验证码是否过期
    if (new Date() > new Date(verificationCode.expires_at)) {
      return NextResponse.json(
        { error: "验证码已过期，请重新获取" },
        { status: 400 }
      )
    }

    // 标记验证码为已使用
    await client.query(
      'UPDATE email_verification_codes SET used = true WHERE id = $1',
      [verificationCode.id]
    )

    // 获取用户信息
    const userResult = await client.query(
      'SELECT id, email, name, avatar FROM users WHERE email = $1',
      [email]
    )

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      )
    }

    const user = userResult.rows[0]

    return NextResponse.json({
      success: true,
      message: "验证成功",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      }
    })
  } catch (error) {
    console.error("验证码验证失败:", error)
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}



