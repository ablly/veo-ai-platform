/**
 * Resend邮件服务模块
 * 用于大批量邮件发送，支持营销邮件和管理员通知
 */

import { Resend } from 'resend'
import { logger } from './logger'

// 初始化Resend客户端
const resend = new Resend(process.env.RESEND_API_KEY)

// 发件人配置
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'VEO AI <onboarding@resend.dev>'

// Resend邮件发送函数
export async function sendEmailWithResend(params: {
  to: string
  subject: string
  html: string
}) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html
    })

    if (error) {
      throw error
    }

    logger.info('Resend邮件发送成功', {
      context: {
        to: params.to,
        subject: params.subject,
        messageId: data?.id
      }
    })

    return { success: true, messageId: data?.id }
  } catch (error) {
    logger.error('Resend邮件发送失败', {
      error: error instanceof Error ? error : new Error(String(error)),
      context: {
        to: params.to,
        subject: params.subject
      }
    })

    return { success: false, error: String(error) }
  }
}

// 管理员邮件模板
export const AdminEmailTemplates = {
  // 自定义邮件模板
  customEmail: (data: {
    subject: string
    content: string
    userName?: string
  }) => ({
    subject: data.subject,
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
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0; 
          }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .message { 
            background: white; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea; 
            white-space: pre-line;
          }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">${data.subject}</h1>
            <p style="margin: 10px 0 0 0;">VEO AI 官方通知</p>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${data.userName || '用户'}</strong>，您好！</p>
            <div class="message">${data.content}</div>
            <div class="footer">
              <p>此邮件由VEO AI管理员发送</p>
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 管理员订单通知
  adminOrderNotification: (data: {
    orderNumber: string
    userName: string
    userEmail: string
    packageName: string
    credits: number
    amount: number
    buyerId: string
    alipayTradeNo: string
    paidAt: string
  }) => ({
    subject: `💰 新订单支付成功 - ${data.packageName} - ¥${data.amount}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 20px auto; padding: 0; }
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
            border-radius: 10px 10px 0 0;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header h1 { margin: 0; font-size: 28px; }
          .header .amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .success-badge { 
            display: inline-block;
            background: #28a745; 
            color: white; 
            padding: 8px 20px; 
            border-radius: 20px; 
            font-weight: bold;
            margin-bottom: 20px;
          }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
          .info-table td:first-child { 
            font-weight: bold; 
            color: #28a745; 
            width: 140px;
            white-space: nowrap;
          }
          .info-table td:last-child { color: #333; word-break: break-all; }
          .highlight-box { 
            background: #d4edda; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 8px; 
            border-left: 4px solid #28a745; 
          }
          .stats-box {
            display: flex;
            justify-content: space-around;
            margin: 25px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }
          .stat-item { text-align: center; }
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            padding: 20px;
            color: #999; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 新订单支付成功</h1>
            <div class="amount">¥${data.amount.toFixed(2)}</div>
            <p style="margin: 0; opacity: 0.9;">支付宝到账通知</p>
          </div>
          <div class="content">
            <div class="success-badge">✅ 支付成功</div>
            
            <div class="stats-box">
              <div class="stat-item">
                <div class="stat-value">¥${data.amount.toFixed(2)}</div>
                <div class="stat-label">实收金额</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${data.credits}</div>
                <div class="stat-label">充值积分</div>
              </div>
            </div>

            <div class="highlight-box">
              <h3 style="margin-top: 0; color: #28a745;">📋 订单详情</h3>
              <table class="info-table">
                <tr>
                  <td>订单号</td>
                  <td>${data.orderNumber}</td>
                </tr>
                <tr>
                  <td>支付宝交易号</td>
                  <td>${data.alipayTradeNo}</td>
                </tr>
                <tr>
                  <td>套餐名称</td>
                  <td>${data.packageName}</td>
                </tr>
                <tr>
                  <td>充值积分</td>
                  <td><strong>${data.credits} 积分</strong></td>
                </tr>
                <tr>
                  <td>支付金额</td>
                  <td><strong style="color: #28a745; font-size: 18px;">¥${data.amount.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td>支付时间</td>
                  <td>${data.paidAt}</td>
                </tr>
              </table>
            </div>

            <h3 style="color: #28a745;">👤 用户信息</h3>
            <table class="info-table">
              <tr>
                <td>用户名称</td>
                <td>${data.userName}</td>
              </tr>
              <tr>
                <td>用户邮箱</td>
                <td>${data.userEmail}</td>
              </tr>
              <tr>
                <td>买家支付宝ID</td>
                <td>${data.buyerId}</td>
              </tr>
            </table>

            <div style="margin: 30px 0; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
              <p style="margin: 0;"><strong>💡 温馨提示：</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>用户积分已自动充值到账</li>
                <li>用户已收到购买成功邮件通知</li>
                <li>系统已完成所有自动化处理</li>
              </ul>
            </div>

            <div class="footer">
              <p>此邮件由系统自动发送，无需回复</p>
              <p>VEO AI - 管理员通知系统</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
}
