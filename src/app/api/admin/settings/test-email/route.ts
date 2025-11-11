import { NextRequest, NextResponse } from "next/server"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {

    const { smtp_host, smtp_port, smtp_user, smtp_password } = await request.json()

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      return createErrorResponse(Errors.BAD_REQUEST, "SMTP配置信息不完整")
    }

    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_port === 465,
      auth: {
        user: smtp_user,
        pass: smtp_password
      }
    })

    try {
      // 验证SMTP连接
      await transporter.verify()

      // 发送测试邮件
      await transporter.sendMail({
        from: smtp_user,
        to: "3533912007@qq.com",
        subject: 'VEO AI - 邮件服务测试',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">邮件服务测试成功</h2>
            <p>您好，管理员！</p>
            <p>这是一封来自VEO AI平台的测试邮件，说明您的SMTP邮件服务配置正确。</p>
            <p>测试时间: ${new Date().toLocaleString('zh-CN')}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              此邮件由VEO AI平台自动发送，请勿回复。
            </p>
          </div>
        `
      })

      logger.info("邮件服务测试成功", {
        smtp_host,
        smtp_port,
        smtp_user
      })

      return NextResponse.json({
        success: true,
        message: "邮件服务测试成功，测试邮件已发送到您的邮箱"
      })

    } catch (smtpError: any) {
      logger.error("邮件服务测试失败", {
        smtp_host,
        smtp_port,
        smtp_user,
        error: smtpError.message
      })

      return NextResponse.json({
        success: false,
        message: `邮件服务测试失败: ${smtpError.message}`
      })
    }

  } catch (error) {
    logger.error("邮件测试失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "邮件测试失败")
  }
}
