import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"
import { sendVerificationCode } from "@/lib/sms-tencent"

const sendPhoneCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号码"),
})

/**
 * 发送管理员告警邮件
 */
async function sendAdminAlert(subject: string, message: string) {
  try {
    const { EmailService } = await import('@/lib/email')
    await EmailService.sendAdminAlert({
      subject,
      message,
      adminEmail: "3533912007@qq.com"
    })
    console.log('✅ 管理员告警邮件已发送')
  } catch (error) {
    console.error('❌ 发送管理员告警邮件失败:', error)
  }
}

/**
 * POST /api/auth/send-phone-code
 * 发送手机验证码
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now()
  const client = await pool.connect()

  try {
    const body = await req.json()
    const { phone } = sendPhoneCodeSchema.parse(body)

    // 安全防护：检查每日发送次数（防刷）
    const dailyCount = await client.query(
      `SELECT COUNT(*) as count FROM phone_verification_codes 
       WHERE phone = $1 AND created_at > NOW() - INTERVAL '24 hours'`,
      [phone]
    )

    const dailyLimit = parseInt(process.env.SMS_DAILY_LIMIT_PER_PHONE || '10')
    if (parseInt(dailyCount.rows[0].count) >= dailyLimit) {
      console.warn(`⚠️ 手机号 ${phone} 今日发送次数已达上限 (${dailyLimit}次)`)
      
      // 发送管理员告警
      sendAdminAlert(
        "🚨 短信发送频率异常",
        `手机号 ${phone} 在24小时内尝试发送验证码超过${dailyLimit}次，可能存在恶意刷短信行为。\n\n请检查是否需要加强防护措施。\n\n时间：${new Date().toLocaleString('zh-CN')}`
      )

      return NextResponse.json(
        { error: "今日发送次数已达上限，请明天再试或联系客服" },
        { status: 429 }
      )
    }

    // 频率限制：1分钟内只能发送1次
    const recentCode = await client.query(
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

    console.log(`📱 准备发送验证码到 ${phone}`)

    // 调用腾讯云短信服务发送验证码
    const smsResult = await sendVerificationCode(phone, code)

    // 记录发送结果到数据库，使用数据库时间生成过期时间（5分钟后）
    await client.query(
      `INSERT INTO phone_verification_codes 
       (phone, code, expires_at, send_status, send_error, tencent_request_id, created_at)
       VALUES ($1, $2, NOW() + INTERVAL '5 minutes', $3, $4, $5, NOW())`,
      [
        phone,
        code,
        smsResult.success ? 'sent' : 'failed',
        smsResult.errorMessage || null,
        smsResult.requestId || null
      ]
    )

    // 记录日志
    await logger.info("手机验证码发送", {
      phone,
      success: smsResult.success,
      requestId: smsResult.requestId,
      errorCode: smsResult.errorCode,
      duration: Date.now() - startTime
    })

    // 如果发送失败，处理错误
    if (!smsResult.success) {
      console.error('❌ 短信发送失败:', {
        phone,
        errorCode: smsResult.errorCode,
        errorMessage: smsResult.errorMessage,
        requestId: smsResult.requestId
      })

      // 根据错误类型发送管理员告警
      if (smsResult.errorCode?.includes('Signature') || 
          smsResult.errorCode?.includes('Template')) {
        // 签名或模板问题
        sendAdminAlert(
          "🚨 紧急：腾讯云短信签名/模板异常",
          `短信发送失败，签名或模板未审核通过。\n\n错误代码：${smsResult.errorCode}\n错误信息：${smsResult.errorMessage}\n请求ID：${smsResult.requestId}\n\n请登录腾讯云控制台检查签名和模板状态。\n\n时间：${new Date().toLocaleString('zh-CN')}`
        )
      } else if (smsResult.errorCode?.includes('Balance')) {
        // 余额不足
        sendAdminAlert(
          "🚨 紧急：腾讯云短信余额不足",
          `短信发送失败，账户余额不足。\n\n错误代码：${smsResult.errorCode}\n错误信息：${smsResult.errorMessage}\n请求ID：${smsResult.requestId}\n\n请立即充值！\n\n时间：${new Date().toLocaleString('zh-CN')}`
        )
      } else if (smsResult.errorCode?.includes('Auth') || 
                 smsResult.errorCode?.includes('SecretId')) {
        // 认证问题
        sendAdminAlert(
          "🚨 紧急：腾讯云短信配置异常",
          `短信发送失败，SecretId或SecretKey配置错误。\n\n错误代码：${smsResult.errorCode}\n错误信息：${smsResult.errorMessage}\n请求ID：${smsResult.requestId}\n\n请检查环境变量配置。\n\n时间：${new Date().toLocaleString('zh-CN')}`
        )
      }

      // 返回用户友好的错误提示
      return NextResponse.json(
        { 
          error: "短信发送失败，请稍后重试或联系客服",
          details: smsResult.errorMessage // 仅用于调试
        },
        { status: 500 }
      )
    }

    // 发送成功
    console.log(`✅ 验证码发送成功 - 手机号: ${phone}, 请求ID: ${smsResult.requestId}, 费用: ${smsResult.fee}分`)

    return NextResponse.json({
      success: true,
      message: "验证码已发送，请注意查收",
      requestId: smsResult.requestId
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ 发送手机验证码失败 (${duration}ms):`, error)
    
    await logger.error("手机验证码发送失败", {
      error: error instanceof Error ? error.message : String(error),
      duration
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    // 发送系统异常告警
    sendAdminAlert(
      "🚨 短信发送系统异常",
      `短信验证码发送接口发生异常。\n\n错误信息：${error instanceof Error ? error.message : String(error)}\n\n时间：${new Date().toLocaleString('zh-CN')}`
    )

    return NextResponse.json(
      { error: "发送失败，请稍后重试" },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}












