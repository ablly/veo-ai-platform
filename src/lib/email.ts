/**
 * QQ邮件服务模块
 * 用于发送各类系统邮件
 */

import nodemailer from 'nodemailer'
import { logger } from './logger'

// 邮件配置
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || ''
  }
}

// 创建邮件发送器
const transporter = nodemailer.createTransport(EMAIL_CONFIG)

// 邮件模板
export const EmailTemplates = {
  // 邮箱验证码登录
  verificationCode: (data: {
    code: string
  }) => ({
    subject: '🔐 您的登录验证码',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #667eea; }
          .code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          .warning { background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 登录验证码</h1>
            <p>VEO AI 视频生成平台</p>
          </div>
          <div class="content">
            <p>您好！</p>
            <p>您正在使用QQ邮箱登录VEO AI，您的验证码是：</p>
            
            <div class="code-box">
              <div class="code">${data.code}</div>
              <p style="color: #666; margin-top: 10px;">验证码有效期10分钟</p>
            </div>

            <div class="warning">
              <p><strong>⚠️ 安全提示：</strong></p>
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>请勿将验证码告知任何人</li>
                <li>如非本人操作，请忽略此邮件</li>
                <li>验证码10分钟内有效</li>
              </ul>
            </div>

            <div class="footer">
              <p>如果您没有请求此验证码，请忽略此邮件</p>
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 重置密码验证码
  passwordResetCode: (data: {
    code: string
    userName: string
  }) => ({
    subject: '🔒 重置密码验证码',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; padding: 30px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #f5576c; }
          .code { font-size: 36px; font-weight: bold; color: #f5576c; letter-spacing: 8px; font-family: 'Courier New', monospace; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          .warning { background: #f8d7da; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545; margin: 20px 0; }
          .info-box { background: #d1ecf1; padding: 15px; border-radius: 5px; border-left: 4px solid #0c5460; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 重置密码</h1>
            <p>VEO AI 视频生成平台</p>
          </div>
          <div class="content">
            <p>您好，${data.userName}！</p>
            <p>您正在重置VEO AI账户密码，您的验证码是：</p>
            
            <div class="code-box">
              <div class="code">${data.code}</div>
              <p style="color: #666; margin-top: 10px;">验证码有效期10分钟</p>
            </div>

            <div class="info-box">
              <p><strong>📝 重置密码步骤：</strong></p>
              <ol style="margin: 5px 0; padding-left: 20px;">
                <li>在重置密码页面输入此验证码</li>
                <li>设置您的新密码（至少6个字符）</li>
                <li>确认新密码并提交</li>
                <li>使用新密码登录您的账户</li>
              </ol>
            </div>

            <div class="warning">
              <p><strong>⚠️ 重要安全提示：</strong></p>
              <ul style="margin: 5px 0; padding-left: 20px;">
                <li>请勿将验证码告知任何人</li>
                <li>如果您没有请求重置密码，请立即忽略此邮件</li>
                <li>如果您怀疑账户安全，请及时联系客服</li>
                <li>验证码10分钟内有效，过期需重新获取</li>
              </ul>
            </div>

            <div class="footer">
              <p>如果您没有请求重置密码，请忽略此邮件</p>
              <p>您的密码将保持不变</p>
              <p style="margin-top: 10px;">VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),


  // 购买成功
  purchaseSuccess: (data: {
    userName: string
    packageName: string
    credits: number
    expiresAt: string
    amount: number
  }) => ({
    subject: `🎉 购买成功 - ${data.packageName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-item { margin: 10px 0; }
          .label { font-weight: bold; color: #667eea; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 购买成功！</h1>
            <p>感谢您购买VEO AI视频生成服务</p>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${data.userName}</strong>，您好！</p>
            <p>您已成功购买 <strong>${data.packageName}</strong>，以下是您的订单详情：</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="label">套餐名称：</span>${data.packageName}
              </div>
              <div class="info-item">
                <span class="label">获得积分：</span>${data.credits} 积分
              </div>
              <div class="info-item">
                <span class="label">支付金额：</span>¥${data.amount.toFixed(2)}
              </div>
              <div class="info-item">
                <span class="label">有效期至：</span>${data.expiresAt}
              </div>
            </div>

            <p>💡 <strong>温馨提示：</strong></p>
            <ul>
              <li>每个视频消耗 15 积分</li>
              <li>套餐到期后剩余积分将清零</li>
              <li>我们会在到期前7天提醒您</li>
            </ul>

            <a href="${process.env.NEXTAUTH_URL}/generate" class="btn">立即开始生成视频</a>

            <div class="footer">
              <p>如有任何问题，请联系客服</p>
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 积分不足提醒
  creditLow: (data: {
    userName: string
    availableCredits: number
  }) => ({
    subject: '⚠️ 积分不足提醒',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fff3cd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107; }
          .btn { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ 积分不足提醒</h1>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${data.userName}</strong>，您好！</p>
            
            <div class="warning-box">
              <p><strong>您的积分余额已不足：</strong></p>
              <p style="font-size: 24px; margin: 10px 0;">剩余 <span style="color: #f5576c;">${data.availableCredits}</span> 积分</p>
              <p>每个视频需要消耗 15 积分，当前余额不足以生成视频。</p>
            </div>

            <p>为了不影响您的使用，建议您尽快充值。</p>

            <a href="${process.env.NEXTAUTH_URL}/credits" class="btn">立即充值</a>

            <div class="footer">
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 即将过期提醒（7天前）
  expiringSoon: (data: {
    userName: string
    packageName: string
    expiresAt: string
    daysLeft: number
    availableCredits: number
  }) => ({
    subject: `⏰ 套餐即将过期提醒 - 还有${data.daysLeft}天`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #fa709a; }
          .btn { display: inline-block; padding: 12px 30px; background: #fa709a; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ 套餐即将过期</h1>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${data.userName}</strong>，您好！</p>
            
            <div class="info-box">
              <p><strong>您的套餐即将到期：</strong></p>
              <p style="font-size: 18px; margin: 10px 0;">
                <span style="color: #fa709a;">${data.packageName}</span>
              </p>
              <p>到期时间：${data.expiresAt}</p>
              <p>剩余天数：<span style="font-size: 24px; color: #fa709a;"><strong>${data.daysLeft}</strong></span> 天</p>
              <p>剩余积分：${data.availableCredits} 积分</p>
            </div>

            <p>⚠️ <strong>重要提醒：</strong></p>
            <ul>
              <li>套餐到期后，剩余积分将被清零</li>
              <li>建议您尽快使用或续费套餐</li>
              <li>续费可以继续享受服务</li>
            </ul>

            <a href="${process.env.NEXTAUTH_URL}/credits" class="btn">立即续费</a>

            <div class="footer">
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 已过期通知
  expired: (data: {
    userName: string
    packageName: string
    expiredAt: string
  }) => ({
    subject: '❌ 套餐已过期通知',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #868f96 0%, #596164 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .expired-box { background: #f8d7da; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; }
          .btn { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ 套餐已过期</h1>
          </div>
          <div class="content">
            <p>尊敬的 <strong>${data.userName}</strong>，您好！</p>
            
            <div class="expired-box">
              <p><strong>您的套餐已到期：</strong></p>
              <p style="font-size: 18px; margin: 10px 0;">
                ${data.packageName}
              </p>
              <p>过期时间：${data.expiredAt}</p>
            </div>

            <p>您的账户已被暂停，无法继续生成视频。</p>
            <p>购买新套餐后即可恢复使用。</p>

            <a href="${process.env.NEXTAUTH_URL}/credits" class="btn">立即购买</a>

            <div class="footer">
              <p>期待您的回归！</p>
              <p>VEO AI - 让创意生动起来</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 管理员警报通知模板
  adminAlert: (data: {
    subject: string
    message: string
  }) => ({
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #f8d7da; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; }
          .message { white-space: pre-line; font-family: 'Courier New', monospace; background: white; padding: 15px; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 系统警报</h1>
            <p>VEO AI 管理员通知</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h3>⚠️ 需要立即处理</h3>
              <div class="message">${data.message}</div>
            </div>
            
            <p><strong>处理建议：</strong></p>
            <ul>
              <li>立即登录速创API管理后台充值</li>
              <li>检查API账户余额和使用情况</li>
              <li>考虑设置余额预警通知</li>
              <li>通知用户服务暂时不可用</li>
            </ul>

            <div class="footer">
              <p>此邮件由系统自动发送</p>
              <p>VEO AI - 系统监控</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  // 管理员订单通知模板
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
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
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
          .stat-item {
            text-align: center;
          }
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
          .action-btn {
            display: inline-block;
            padding: 12px 30px;
            background: #28a745;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 5px;
            font-weight: bold;
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
                <li>如有异常请及时查看后台日志</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="action-btn">
                查看所有订单
              </a>
              <a href="${process.env.NEXTAUTH_URL}/admin/statistics" class="action-btn">
                查看统计数据
              </a>
            </div>

            <div class="footer">
              <p>此邮件由系统自动发送，无需回复</p>
              <p>VEO AI - 管理员通知系统</p>
              <p style="margin-top: 10px; color: #999;">
                收到此邮件表示支付宝已成功到账
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  })
}

// 发送邮件函数
export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"VEO AI" <${EMAIL_CONFIG.auth.user}>`,
      to: params.to,
      subject: params.subject,
      html: params.html
    })

    logger.info('邮件发送成功', {
      context: {
        to: params.to,
        subject: params.subject,
        messageId: info.messageId
      }
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    logger.error('邮件发送失败', {
      error: error instanceof Error ? error : new Error(String(error)),
      context: {
        to: params.to,
        subject: params.subject
      }
    })

    return { success: false, error: String(error) }
  }
}

// 发送验证码邮件（兼容旧代码）
export async function sendVerificationEmail(email: string, code: string) {
  const template = EmailTemplates.verificationCode({ code })
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html
  })
}

// 便捷发送方法
export const EmailService = {
  // 发送验证码
  sendVerificationCode: async (email: string, code: string) => {
    return sendVerificationEmail(email, code)
  },

  // 发送重置密码验证码
  sendPasswordResetCode: async (params: {
    to: string
    code: string
    userName: string
  }) => {
    const template = EmailTemplates.passwordResetCode({
      code: params.code,
      userName: params.userName
    })
    return sendEmail({
      to: params.to,
      subject: template.subject,
      html: template.html
    })
  },


  // 发送购买成功邮件
  sendPurchaseSuccess: async (params: {
    email: string
    userName: string
    packageName: string
    credits: number
    expiresAt: string
    amount: number
  }) => {
    const template = EmailTemplates.purchaseSuccess(params)
    return sendEmail({
      to: params.email,
      subject: template.subject,
      html: template.html
    })
  },

  // 发送积分不足提醒
  sendCreditLow: async (params: {
    email: string
    userName: string
    availableCredits: number
  }) => {
    const template = EmailTemplates.creditLow(params)
    return sendEmail({
      to: params.email,
      subject: template.subject,
      html: template.html
    })
  },

  // 发送即将过期提醒
  sendExpiringSoon: async (params: {
    email: string
    userName: string
    packageName: string
    expiresAt: string
    daysLeft: number
    availableCredits: number
  }) => {
    const template = EmailTemplates.expiringSoon(params)
    return sendEmail({
      to: params.email,
      subject: template.subject,
      html: template.html
    })
  },

  // 发送已过期通知
  sendExpired: async (params: {
    email: string
    userName: string
    packageName: string
    expiredAt: string
  }) => {
    const template = EmailTemplates.expired(params)
    return sendEmail({
      to: params.email,
      subject: template.subject,
      html: template.html
    })
  },

  // 发送管理员警报通知
  sendAdminAlert: async (params: {
    subject: string
    message: string
    adminEmail: string
  }) => {
    const template = EmailTemplates.adminAlert(params)
    return sendEmail({
      to: params.adminEmail,
      subject: template.subject,
      html: template.html
    })
  },

  // 发送管理员订单通知
  sendAdminOrderNotification: async (params: {
    orderNumber: string
    userName: string
    userEmail: string
    packageName: string
    credits: number
    amount: number
    buyerId: string
    alipayTradeNo: string
    paidAt: string
  }) => {
    // 从环境变量获取管理员邮箱
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (!adminEmail) {
      logger.error('管理员邮箱未配置', { 
        error: new Error('ADMIN_EMAIL environment variable not set')
      })
      return { success: false, error: 'Admin email not configured' }
    }

    const template = EmailTemplates.adminOrderNotification(params)
    return sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html
    })
  }
}
