/**
 * 营销邮件模板
 * 用于用户转化和留存
 */

// 1. 注册欢迎邮件（立即发送）
export const welcomeEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '🎉 欢迎加入VEO AI！开启您的创作之旅',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credits-box { 
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 12px; 
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .credits-number { 
          font-size: 48px; 
          font-weight: bold; 
          color: #333;
          margin: 10px 0;
        }
        .btn { 
          display: inline-block; 
          padding: 15px 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .feature-box {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎉 欢迎加入VEO AI</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">开启您的AI视频创作之旅</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">嗨，<strong>${data.userName}</strong>！</p>
          <p>感谢您注册VEO AI视频生成平台。我们很高兴能够帮助您将创意变为现实！</p>
          
          <div class="credits-box">
            <div style="font-size: 20px; color: #666;">🎁 新用户礼包</div>
            <div class="credits-number">${data.credits}</div>
            <div style="font-size: 18px; color: #666;">免费积分已到账</div>
            <p style="margin: 15px 0 0 0; color: #666;">立即开始创作您的第一个AI视频</p>
          </div>

          <div class="feature-box">
            <h3 style="margin-top: 0; color: #667eea;">✨ 您可以做什么</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>用文字描述生成专业视频</li>
              <li>上传图片+文字创作视频</li>
              <li>多种视频风格和时长选择</li>
              <li>高清视频下载和分享</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/generate" class="btn">
              立即开始创作 →
            </a>
          </div>

          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #2e7d32;"><strong>💡 温馨提示：</strong></p>
            <p style="margin: 10px 0 0 0; color: #2e7d32;">
              首次充值可额外获得<strong>50%赠送积分</strong>！例如购买50积分，实得75积分。
            </p>
          </div>

          <div class="footer">
            <p>如有任何问题，随时联系我们</p>
            <p>VEO AI - 让创意生动起来</p>
            <p style="margin-top: 15px;">
              <a href="${process.env.NEXTAUTH_URL}/pricing" style="color: #667eea;">查看套餐</a> | 
              <a href="${process.env.NEXTAUTH_URL}/docs" style="color: #667eea;">使用教程</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})


// 2. 积分即将用完提醒（积分<3时发送）
export const creditLowEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '⚠️ 您的VEO AI积分即将用完',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .warning-box { 
          background: #fff3cd;
          padding: 25px; 
          margin: 20px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ffc107;
          text-align: center;
        }
        .credits-number { 
          font-size: 42px; 
          font-weight: bold; 
          color: #ff6b6b;
          margin: 10px 0;
        }
        .btn { 
          display: inline-block; 
          padding: 15px 40px; 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .offer-box {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          padding: 25px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">⚠️ 积分即将用完</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">继续创作需要充值积分</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">嗨，<strong>${data.userName}</strong>！</p>
          <p>我们注意到您的VEO AI积分即将用完。</p>
          
          <div class="warning-box">
            <div style="font-size: 18px; color: #856404;">⚡ 当前剩余积分</div>
            <div class="credits-number">${data.credits}</div>
            <p style="margin: 10px 0 0 0; color: #856404;">充值后可继续创作精彩视频</p>
          </div>

          <div class="offer-box">
            <h3 style="margin-top: 0; color: #155724;">🎁 首单特惠</h3>
            <p style="font-size: 20px; margin: 10px 0; color: #155724;">
              <strong>首次充值额外赠送50%积分！</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #155724;">
              例如：购买50积分，实得75积分
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="btn">
              立即充值 →
            </a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">💡 为什么选择VEO AI？</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>真实物理运动模拟</li>
              <li>专业级镜头控制</li>
              <li>极速生成高质量视频</li>
              <li>支持多种视频风格</li>
            </ul>
          </div>

          <div class="footer">
            <p>继续创作，让创意无限可能</p>
            <p>VEO AI - 让创意生动起来</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})


// 3. 积分用完提醒（积分=0时发送）
export const creditEmptyEmail = (data: {
  userName: string
}) => ({
  subject: '💳 继续创作！VEO AI限时优惠等您来',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .empty-box { 
          background: white;
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 8px; 
          text-align: center;
          border: 2px dashed #f5576c;
        }
        .btn { 
          display: inline-block; 
          padding: 15px 40px; 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .offer-highlight {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          padding: 25px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        .package-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .package-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          border: 2px solid #e0e0e0;
        }
        .package-item.popular {
          border-color: #f5576c;
          position: relative;
        }
        .popular-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #f5576c;
          color: white;
          padding: 5px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: bold;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">💳 积分已用完</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">充值后继续创作精彩视频</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">嗨，<strong>${data.userName}</strong>！</p>
          <p>您的VEO AI积分已经用完，但创作之旅不应止步于此！</p>
          
          <div class="empty-box">
            <div style="font-size: 48px; margin-bottom: 10px;">😢</div>
            <p style="font-size: 20px; margin: 10px 0; color: #666;">
              当前积分：<strong style="color: #f5576c;">0</strong>
            </p>
            <p style="color: #999;">充值后立即恢复创作</p>
          </div>

          <div class="offer-highlight">
            <h3 style="margin-top: 0; color: #333;">🎁 首单特惠</h3>
            <p style="font-size: 24px; margin: 10px 0; color: #333;">
              <strong>首次充值额外赠送50%积分！</strong>
            </p>
            <p style="margin: 10px 0 0 0; color: #666;">
              现在充值，获得更多创作机会
            </p>
          </div>

          <h3 style="text-align: center; color: #333;">推荐套餐</h3>
          <div class="package-grid">
            <div class="package-item">
              <div style="font-size: 14px; color: #999;">基础套餐</div>
              <div style="font-size: 32px; font-weight: bold; color: #333; margin: 10px 0;">50</div>
              <div style="font-size: 14px; color: #999;">积分</div>
              <div style="font-size: 20px; font-weight: bold; color: #f5576c; margin: 10px 0;">¥24.50</div>
              <div style="font-size: 12px; color: #28a745;">+赠送25积分</div>
            </div>
            <div class="package-item popular">
              <span class="popular-badge">最受欢迎</span>
              <div style="font-size: 14px; color: #999;">专业套餐</div>
              <div style="font-size: 32px; font-weight: bold; color: #333; margin: 10px 0;">150</div>
              <div style="font-size: 14px; color: #999;">积分</div>
              <div style="font-size: 20px; font-weight: bold; color: #f5576c; margin: 10px 0;">¥49.50</div>
              <div style="font-size: 12px; color: #28a745;">+赠送75积分</div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="btn">
              立即充值 →
            </a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">✨ 用户好评</h4>
            <p style="margin: 10px 0; color: #666; font-style: italic;">
              "VEO AI生成的视频质量超出预期，非常适合社交媒体内容创作！"
            </p>
            <p style="margin: 10px 0; color: #999; font-size: 14px;">- 小红书创作者</p>
          </div>

          <div class="footer">
            <p>继续创作，让创意无限可能</p>
            <p>VEO AI - 让创意生动起来</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})


// 4. 注册后24小时未购买（定时任务）
export const firstPurchaseOfferEmail = (data: {
  userName: string
  credits: number
}) => ({
  subject: '🎁 特别优惠！首次充值额外赠送50%积分',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .offer-box { 
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 12px; 
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .countdown-box {
          background: #fff3cd;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
          border: 2px dashed #ffc107;
        }
        .btn { 
          display: inline-block; 
          padding: 15px 40px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin: 20px 0;
        }
        .feature-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🎁 特别优惠</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">首次充值额外赠送50%积分</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">嗨，<strong>${data.userName}</strong>！</p>
          <p>感谢您体验VEO AI！我们注意到您还有 <strong>${data.credits}</strong> 个免费积分。</p>
          <p>为了让您创作更多精彩视频，我们为您准备了一份特别优惠：</p>
          
          <div class="offer-box">
            <h2 style="margin-top: 0; color: #333; font-size: 28px;">首单特惠</h2>
            <p style="font-size: 32px; margin: 15px 0; color: #333;">
              <strong>+50%</strong>
            </p>
            <p style="font-size: 18px; margin: 10px 0; color: #666;">
              首次充值额外赠送50%积分
            </p>
            <p style="margin: 15px 0 0 0; color: #666;">
              例如：购买50积分，实得<strong style="color: #28a745;">75积分</strong>
            </p>
          </div>

          <div class="countdown-box">
            <p style="margin: 0; font-size: 16px; color: #856404;">
              ⏰ 限时优惠，机会难得
            </p>
          </div>

          <h3 style="text-align: center; color: #333;">为什么选择VEO AI？</h3>
          <div class="feature-grid">
            <div class="feature-item">
              <div style="font-size: 32px; margin-bottom: 10px;">⚡</div>
              <div style="font-size: 14px; color: #666;">极速生成</div>
            </div>
            <div class="feature-item">
              <div style="font-size: 32px; margin-bottom: 10px;">🎨</div>
              <div style="font-size: 14px; color: #666;">专业品质</div>
            </div>
            <div class="feature-item">
              <div style="font-size: 32px; margin-bottom: 10px;">🎬</div>
              <div style="font-size: 14px; color: #666;">多种风格</div>
            </div>
            <div class="feature-item">
              <div style="font-size: 32px; margin-bottom: 10px;">💯</div>
              <div style="font-size: 14px; color: #666;">高清下载</div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="btn">
              立即充值享优惠 →
            </a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">💡 温馨提示</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>首单特惠仅限首次充值</li>
              <li>赠送积分与购买积分同等使用</li>
              <li>支持支付宝和stripe和信用卡支付</li>
            </ul>
          </div>

          <div class="footer">
            <p>继续创作，让创意无限可能</p>
            <p>VEO AI - 让创意生动起来</p>
            <p style="margin-top: 15px; font-size: 11px;">
              不想再收到此类邮件？<a href="${process.env.NEXTAUTH_URL}/profile" style="color: #667eea;">取消订阅</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})


// 5. 注册后7天未购买（最后提醒）
export const lastChanceOfferEmail = (data: {
  userName: string
}) => ({
  subject: '⏰ 最后机会！VEO AI首单特惠即将结束',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
          border-radius: 10px 10px 0 0; 
        }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .urgent-box { 
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
          color: white;
          padding: 30px; 
          margin: 20px 0; 
          border-radius: 12px; 
          text-align: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .btn { 
          display: inline-block; 
          padding: 15px 40px; 
          background: white;
          color: #ff6b6b; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 20px;
          font-weight: bold;
          font-size: 16px;
        }
        .testimonial-box {
          background: white;
          padding: 20px;
          margin: 15px 0;
          border-radius: 8px;
          border-left: 4px solid #ff6b6b;
        }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">⏰ 最后机会</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">首单特惠即将结束</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">嗨，<strong>${data.userName}</strong>！</p>
          <p>这是我们最后一次提醒您：<strong>首单特惠即将结束</strong>！</p>
          
          <div class="urgent-box">
            <h2 style="margin-top: 0; color: white; font-size: 28px;">🎁 首单特惠</h2>
            <p style="font-size: 36px; margin: 15px 0; font-weight: bold;">
              +50%
            </p>
            <p style="font-size: 18px; margin: 10px 0;">
              首次充值额外赠送50%积分
            </p>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">
              错过这次，优惠不再
            </p>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 18px; color: #856404;">
              ⚠️ 这是您最后的机会
            </p>
            <p style="margin: 10px 0 0 0; color: #856404;">
              首单特惠仅限新用户首次充值
            </p>
          </div>

          <h3 style="text-align: center; color: #333;">用户真实评价</h3>
          
          <div class="testimonial-box">
            <p style="margin: 0; color: #666; font-style: italic;">
              "VEO AI的视频质量真的很棒，用来做短视频内容非常合适！"
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">- 抖音创作者</p>
          </div>

          <div class="testimonial-box">
            <p style="margin: 0; color: #666; font-style: italic;">
              "生成速度快，效果专业，性价比很高！"
            </p>
            <p style="margin: 10px 0 0 0; color: #999; font-size: 14px;">- 小红书博主</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/pricing" class="btn">
              立即抓住机会 →
            </a>
          </div>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">💡 为什么现在就要充值？</h4>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>首单特惠仅此一次，错过不再</li>
              <li>额外50%积分，创作更多视频</li>
              <li>支持多种支付方式，安全便捷</li>
            </ul>
          </div>

          <div class="footer">
            <p>把握机会，开启创作之旅</p>
            <p>VEO AI - 让创意生动起来</p>
            <p style="margin-top: 15px; font-size: 11px;">
              不想再收到此类邮件？<a href="${process.env.NEXTAUTH_URL}/profile" style="color: #ff6b6b;">取消订阅</a>
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
})
