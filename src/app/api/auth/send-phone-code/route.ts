import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"

const sendPhoneCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone } = sendPhoneCodeSchema.parse(body)

    // 检查是否在1分钟内已发送过验证码
    const recentCode = await pool.query(
      `SELECT * FROM phone_verification_codes 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '1 minute'
       ORDER BY created_at DESC LIMIT 1`,
      [phone]
    )

    if (recentCode.rows.length > 0) {
      return NextResponse.json(
        { error: "请等待1分钟后再试" },
        { status: 429 }
      )
    }

    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期

    // 保存验证码到数据库
    await pool.query(
      `INSERT INTO phone_verification_codes (phone, code, expires_at, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [phone, code, expiresAt]
    )

    // 记录日志
    await logger.info("手机验证码发送", {
      phone,
      code,
      expiresAt: expiresAt.toISOString(),
    })

    // 在开发环境下，直接返回验证码（生产环境应该通过短信服务发送）
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        message: "验证码已发送",
        devCode: code, // 仅开发环境返回
      })
    }

    // 生产环境：这里应该调用短信服务发送验证码
    // TODO: 集成短信服务（如腾讯云短信、阿里云短信等）
    console.log(`📱 手机验证码发送到 ${phone}: ${code}`)

    return NextResponse.json({
      success: true,
      message: "验证码已发送",
    })

  } catch (error) {
    console.error("发送手机验证码失败:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "发送失败" },
      { status: 500 }
    )
  }
}
