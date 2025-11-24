/**
 * 优化后的邮件模板 - 系统通知风格
 * 目标：提高送达率，减少垃圾邮件特征
 */

// 通用样式
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
  .container { max-width: 600px; margin: 20px auto; background: white; }
  .header { background: #4a5568; color: white; padding: 20px 30px; }
  .content { padding: 30px; }
  .info-box { background: #f7fafc; padding: 20px; margin: 20px 0; border-left: 3px solid #4a5568; }
  .link { color: #4a5568; text-decoration: none; }
  .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; }
`

// 1. 积分余额提醒（积分 < 10）
export const creditLowEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '【VEO AI】账户积分余额提醒',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 18px; font-weight: normal;">VEO AI 系统通知</h2>
        </div>
        <div class="content">
          <p>您好，${data.userName}</p>
          <p>这是一条账户余额提醒。</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>当前积分余额</strong></p>
            <p style="margin: 0; font-size: 24px; color: #4a5568;">${data.credits} 积分</p>
          </div>

          <p>您可以继续使用现有积分创作视频，或访问账户页面查看套餐选项。</p>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="link">查看套餐选项</a>
          </p>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            这是一封自动发送的系统通知邮件。
          </p>
        </div>
        <div class="footer">
          <p>VEO AI 视频生成平台</p>
          <p><a href="${process.env.NEXTAUTH_URL}/profile" style="color: #718096;">管理邮件偏好</a></p>
        </div>
      </div>
    </body>
    </html>
  `
})

// 2. 积分已用完通知（积分 = 0）
export const creditEmptyEmail = (data: {
  userName: string
}) => ({
  subject: '【VEO AI】账户积分已用完',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 18px; font-weight: normal;">VEO AI 系统通知</h2>
        </div>
        <div class="content">
          <p>您好，${data.userName}</p>
          <p>您的账户积分已用完。</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>当前积分余额</strong></p>
            <p style="margin: 0; font-size: 24px; color: #4a5568;">0 积分</p>
          </div>

          <p>如需继续使用服务，请访问账户页面选择合适的套餐。</p>

          <div style="background: #edf2f7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #4a5568;">
              <strong>新用户福利：</strong>首次购买可获得额外积分赠送
            </p>
          </div>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="link">查看套餐选项</a>
          </p>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            这是一封自动发送的系统通知邮件。
          </p>
        </div>
        <div class="footer">
          <p>VEO AI 视频生成平台</p>
          <p><a href="${process.env.NEXTAUTH_URL}/profile" style="color: #718096;">管理邮件偏好</a></p>
        </div>
      </div>
    </body>
    </html>
  `
})

// 3. 新用户福利说明（注册24小时后）
export const firstPurchaseOfferEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '【VEO AI】新用户福利说明',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 18px; font-weight: normal;">VEO AI 系统通知</h2>
        </div>
        <div class="content">
          <p>您好，${data.userName}</p>
          <p>感谢您使用 VEO AI 视频生成服务。</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>当前账户状态</strong></p>
            <p style="margin: 0;">剩余积分：${data.credits}</p>
            <p style="margin: 10px 0 0 0;">账户类型：免费用户</p>
          </div>

          <p>作为新用户，您可以享受以下福利：</p>

          <div style="background: #edf2f7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a5568;">
              <strong>新用户福利</strong>
            </p>
            <p style="margin: 0; font-size: 14px; color: #4a5568;">
              首次购买套餐可获得额外 50% 积分赠送
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #718096;">
              例如：购买 50 积分套餐，实际获得 75 积分
            </p>
          </div>

          <p>您可以访问账户页面了解详情。</p>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="link">查看套餐详情</a>
          </p>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            这是一封自动发送的系统通知邮件。
          </p>
        </div>
        <div class="footer">
          <p>VEO AI 视频生成平台</p>
          <p><a href="${process.env.NEXTAUTH_URL}/profile" style="color: #718096;">管理邮件偏好</a></p>
        </div>
      </div>
    </body>
    </html>
  `
})

// 4. 账户使用提醒（注册7天后）
export const lastChanceOfferEmail = (data: {
  userName: string
}) => ({
  subject: '【VEO AI】账户使用提醒',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 18px; font-weight: normal;">VEO AI 系统通知</h2>
        </div>
        <div class="content">
          <p>您好，${data.userName}</p>
          <p>这是一条账户使用提醒。</p>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: #4a5568;">
              您已注册 VEO AI 服务一段时间，我们注意到您可能还在使用免费积分。
            </p>
          </div>

          <p>如果您对服务满意，可以考虑选择合适的套餐以获得更多创作机会。</p>

          <div style="background: #edf2f7; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #4a5568;">
              <strong>新用户福利</strong>
            </p>
            <p style="margin: 0; font-size: 14px; color: #4a5568;">
              首次购买套餐可获得额外 50% 积分赠送
            </p>
          </div>

          <p>您可以访问账户页面了解更多信息。</p>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="link">查看套餐信息</a>
          </p>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            这是一封自动发送的系统通知邮件。如不希望收到此类提醒，可以在账户设置中调整邮件偏好。
          </p>
        </div>
        <div class="footer">
          <p>VEO AI 视频生成平台</p>
          <p><a href="${process.env.NEXTAUTH_URL}/profile" style="color: #718096;">管理邮件偏好</a></p>
        </div>
      </div>
    </body>
    </html>
  `
})

// 5. 欢迎邮件（保持简洁）
export const welcomeEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '【VEO AI】欢迎使用视频生成服务',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>${emailStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0; font-size: 18px; font-weight: normal;">VEO AI 系统通知</h2>
        </div>
        <div class="content">
          <p>您好，${data.userName}</p>
          <p>欢迎注册 VEO AI 视频生成平台。</p>
          
          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>账户信息</strong></p>
            <p style="margin: 0;">初始积分：${data.credits}</p>
            <p style="margin: 10px 0 0 0;">账户状态：已激活</p>
          </div>

          <p>您现在可以开始使用服务创作视频。</p>

          <p style="margin-top: 20px;"><strong>主要功能：</strong></p>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>文字描述生成视频</li>
            <li>图片配合文字创作</li>
            <li>多种视频时长选择</li>
            <li>高清视频下载</li>
          </ul>

          <p style="margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/generate" class="link">开始创作</a>
          </p>

          <p style="margin-top: 30px; color: #718096; font-size: 14px;">
            这是一封自动发送的系统通知邮件。
          </p>
        </div>
        <div class="footer">
          <p>VEO AI 视频生成平台</p>
          <p><a href="${process.env.NEXTAUTH_URL}/profile" style="color: #718096;">管理邮件偏好</a></p>
        </div>
      </div>
    </body>
    </html>
  `
})
