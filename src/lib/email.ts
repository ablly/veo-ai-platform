import { Resend } from "resend"
import { PRODUCTION_CONFIG, getEmailTemplate, getEmailConfig } from "@/config/production"

// 初始化Resend客户端
const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * 发送验证码邮件
 */
export async function sendVerificationEmail(email: string, code: string) {
  const template = getEmailTemplate('verification')
  const config = getEmailConfig()

  try {
    const result = await resend.emails.send({
      from: config.from,
      to: [email],
      subject: template.subject,
      html: generateVerificationEmailHTML(code),
      replyTo: config.replyTo
    })

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("邮件发送失败:", error)
    throw new Error("邮件发送失败")
  }
}

/**
 * 发送欢迎邮件
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const template = getEmailTemplate('welcome')
  const config = getEmailConfig()

  try {
    const result = await resend.emails.send({
      from: config.from,
      to: [email],
      subject: template.subject,
      html: generateWelcomeEmailHTML(name),
      replyTo: config.replyTo
    })

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("欢迎邮件发送失败:", error)
    throw new Error("欢迎邮件发送失败")
  }
}

/**
 * 发送购买确认邮件
 */
export async function sendPurchaseConfirmationEmail(
  email: string, 
  orderDetails: {
    orderId: string
    packageName: string
    credits: number
    amount: number
  }
) {
  const template = getEmailTemplate('purchase')
  const config = getEmailConfig()

  try {
    const result = await resend.emails.send({
      from: config.from,
      to: [email],
      subject: template.subject,
      html: generatePurchaseEmailHTML(orderDetails),
      replyTo: config.replyTo
    })

    return { success: true, messageId: result.data?.id }
  } catch (error) {
    console.error("购买确认邮件发送失败:", error)
    throw new Error("购买确认邮件发送失败")
  }
}

/**
 * 生成验证码邮件HTML
 */
function generateVerificationEmailHTML(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${PRODUCTION_CONFIG.APP_NAME} 登录验证码</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">${PRODUCTION_CONFIG.APP_NAME}</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">${PRODUCTION_CONFIG.APP_DESCRIPTION}</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">登录验证码</h2>
          <p style="color: #666; margin: 0 0 30px 0; font-size: 16px; line-height: 1.5;">
            您好！您正在登录${PRODUCTION_CONFIG.APP_NAME}平台，请使用以下验证码完成登录：
          </p>
          
          <!-- Verification Code -->
          <div style="background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; color: #2d3436; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ffeaa7;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>重要提示：</strong><br>
              • 验证码有效期为 <strong>${PRODUCTION_CONFIG.VERIFICATION_CODE.EXPIRY_MINUTES}分钟</strong><br>
              • 请勿将验证码告诉他人<br>
              • 如非本人操作，请忽略此邮件
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #999; font-size: 12px;">
            此邮件由 ${PRODUCTION_CONFIG.APP_NAME} 自动发送，请勿回复<br>
            如需帮助，请联系客服：${PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL}<br>
            ${PRODUCTION_CONFIG.LEGAL.COPYRIGHT}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * 生成欢迎邮件HTML
 */
function generateWelcomeEmailHTML(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>欢迎加入 ${PRODUCTION_CONFIG.APP_NAME}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); padding: 40px 20px; text-align: center;">
          <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">欢迎加入 ${PRODUCTION_CONFIG.APP_NAME}！</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">开启您的AI视频创作之旅</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">您好，${name}！</h2>
          <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            感谢您注册${PRODUCTION_CONFIG.APP_NAME}！我们已为您准备了${PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS}积分的新用户礼包，您可以立即开始体验AI视频生成功能。
          </p>
          
          <div style="background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: white; margin: 0 0 10px 0; font-size: 20px;">🎉 新用户礼包</h3>
            <p style="color: white; margin: 0; font-size: 16px;">${PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS} 积分已到账</p>
          </div>
          
          <p style="color: #666; margin: 20px 0; font-size: 16px; line-height: 1.5;">
            现在您可以：<br>
            • 生成 ${Math.floor(PRODUCTION_CONFIG.CREDITS.NEW_USER_BONUS / PRODUCTION_CONFIG.CREDITS.VIDEO_GENERATION_COST)} 个AI视频<br>
            • 体验真实物理运动效果<br>
            • 享受高级镜头控制功能
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #999; font-size: 12px;">
            如需帮助，请联系客服：${PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL}<br>
            工作时间：${PRODUCTION_CONFIG.SUPPORT.WORK_HOURS}<br>
            ${PRODUCTION_CONFIG.LEGAL.COPYRIGHT}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * 生成购买确认邮件HTML
 */
function generatePurchaseEmailHTML(orderDetails: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${PRODUCTION_CONFIG.APP_NAME} 购买确认</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); padding: 40px 20px; text-align: center;">
          <div style="width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">购买成功！</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">感谢您的购买</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 20px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">订单详情</h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666;"><strong>订单号：</strong>${orderDetails.orderId}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>套餐：</strong>${orderDetails.packageName}</p>
            <p style="margin: 0 0 10px 0; color: #666;"><strong>积分：</strong>${orderDetails.credits} 积分</p>
            <p style="margin: 0; color: #666;"><strong>金额：</strong>¥${orderDetails.amount}</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0;">
            <h3 style="color: white; margin: 0 0 10px 0; font-size: 20px;">✨ 积分已到账</h3>
            <p style="color: white; margin: 0; font-size: 16px;">${orderDetails.credits} 积分已添加到您的账户</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #999; font-size: 12px;">
            如需帮助，请联系客服：${PRODUCTION_CONFIG.EMAIL.SUPPORT_EMAIL}<br>
            ${PRODUCTION_CONFIG.PAYMENT.REFUND_POLICY_DAYS}天内支持退款<br>
            ${PRODUCTION_CONFIG.LEGAL.COPYRIGHT}
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}



