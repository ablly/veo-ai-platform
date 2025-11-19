import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import { z } from "zod"
import pool from "@/lib/db"
import { CREDIT_CONFIG } from "@/config/credits"

const registerSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
  password: z.string().min(6, "密码至少需要6个字符"),
})

export async function POST(req: NextRequest) {
  let client;
  
  try {
    console.log("🚀 开始处理注册请求...")
    
    const body = await req.json()
    console.log("📝 接收到的数据:", { ...body, password: "***" })
    
    const { name, email, phone, password } = registerSchema.parse(body)
    
    // 尝试连接数据库
    console.log("🔗 正在连接到Supabase数据库...")
    client = await pool.connect()
    console.log("✅ 数据库连接成功")

    console.log("🔗 连接到Supabase数据库")
    
    // 开始事务
    await client.query('BEGIN')
    
    try {
      // 1. 检查邮箱是否已验证
      const checkEmailVerified = await client.query(
        'SELECT id, email_verified FROM users WHERE email = $1',
        [email]
      )
      
      if (checkEmailVerified.rows.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: "该邮箱已被注册" },
          { status: 400 }
        )
      }

      // 2. 验证邮箱是否已通过验证码验证
      // 检查是否有已验证的验证码记录
      const verifiedCodeCheck = await client.query(
        `SELECT id FROM email_verification_codes 
         WHERE email = $1 AND used = true 
         ORDER BY created_at DESC LIMIT 1`,
        [email]
      )

      if (verifiedCodeCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: "请先验证邮箱" },
          { status: 400 }
        )
      }

      // 3. 检查手机号是否已存在
      const checkPhone = await client.query(
        'SELECT id FROM users WHERE phone = $1',
        [phone]
      )
      
      if (checkPhone.rows.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: "该手机号已被注册" },
          { status: 400 }
        )
      }
      
      // 4. 加密密码
      const hashedPassword = await bcryptjs.hash(password, 12)
      console.log("🔐 密码加密完成")
      
      // 5. 创建用户（标记邮箱已验证）
      const createUserResult = await client.query(
        `INSERT INTO users (email, phone, name, password, email_verified, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW()) 
         RETURNING id, email, phone, name, created_at`,
        [email, phone, name, hashedPassword]
      )
      
      const newUser = createUserResult.rows[0]
      console.log("✅ 用户创建成功，ID:", newUser.id)
      
      // 6. 创建积分账户（赠送新用户体验积分）
      const bonusCredits = CREDIT_CONFIG.WELCOME_CREDITS
      await client.query(
        `INSERT INTO user_credit_accounts 
         (user_id, total_credits, available_credits, used_credits, frozen_credits, created_at, updated_at) 
         VALUES ($1, $2, $2, 0, 0, NOW(), NOW())`,
        [newUser.id, bonusCredits]
      )
      // 5. 记录积分交易
      await client.query(
        `INSERT INTO credit_transactions 
         (user_id, transaction_type, credit_amount, balance_before, balance_after, description, created_at) 
         VALUES ($1, 'BONUS', $2, 0, $2, '新用户注册赠送 - 可体验视频生成', NOW())`,
        [newUser.id, bonusCredits]
      )
      
      // 提交事务
      await client.query('COMMIT')

      // 返回用户信息
      return NextResponse.json({
        success: true,
        message: "注册成功！已赠送10积分 🎉",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          credits: bonusCredits,
          createdAt: newUser.created_at
        }
      })
      
    } catch (dbError) {
      await client.query('ROLLBACK')
      console.error("❌ 数据库操作失败:", dbError)
      console.error("❌ 详细错误:", JSON.stringify(dbError, null, 2))
      return NextResponse.json(
        { 
          error: "数据库操作失败", 
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("💥 注册异常:", error)
    console.error("💥 异常堆栈:", error instanceof Error ? error.stack : 'No stack')
    
    if (error instanceof z.ZodError) {
      console.error("📋 数据验证错误:", error.issues)
      return NextResponse.json(
        { error: "输入数据无效", details: error.issues },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("💥 最终错误消息:", errorMessage)
    
    return NextResponse.json(
      { 
        error: `注册失败: ${errorMessage}`,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    )
  } finally {
    if (client) {
      client.release()
    }
  }
}
