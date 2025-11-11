/**
 * 简化版管理员邮件测试（直接使用 nodemailer）
 * 运行方式：node test-admin-email-simple.mjs
 */

import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

console.log('🧪 开始测试管理员邮件通知...\n')

// 检查环境变量
console.log('📋 环境变量检查:')
console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ 已配置' : '❌ 未配置'}`)
console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ 已配置' : '❌ 未配置'}`)
console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ 已配置' : '❌ 未配置'}`)
console.log('')

if (!process.env.ADMIN_EMAIL || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
  console.error('❌ 错误: 环境变量配置不完整')
  process.exit(1)
}

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE !== 'false',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

// 测试订单数据
const testOrderData = {
  orderNumber: 'TEST' + Date.now(),
  userName: '测试用户',
  userEmail: 'test@example.com',
  packageName: '基础套餐',
  credits: 50,
  amount: 49.00,
  buyerId: '2088123456789012',
  alipayTradeNo: '2024' + Date.now(),
  paidAt: new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 生成邮件HTML
const emailHtml = `
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
    .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .info-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .info-table td:first-child { font-weight: bold; color: #28a745; width: 140px; }
    .highlight-box { 
      background: #d4edda; 
      padding: 20px; 
      margin: 20px 0; 
      border-radius: 8px; 
      border-left: 4px solid #28a745; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 新订单支付成功</h1>
      <div class="amount">¥${testOrderData.amount.toFixed(2)}</div>
      <p style="margin: 0; opacity: 0.9;">支付宝到账通知 - 测试邮件</p>
    </div>
    <div class="content">
      <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <strong>⚠️ 这是一封测试邮件</strong>
        <p style="margin: 5px 0 0 0;">如果您收到此邮件，说明管理员邮件通知功能配置成功！</p>
      </div>

      <div class="highlight-box">
        <h3 style="margin-top: 0; color: #28a745;">📋 测试订单详情</h3>
        <table class="info-table">
          <tr>
            <td>订单号</td>
            <td>${testOrderData.orderNumber}</td>
          </tr>
          <tr>
            <td>支付宝交易号</td>
            <td>${testOrderData.alipayTradeNo}</td>
          </tr>
          <tr>
            <td>套餐名称</td>
            <td>${testOrderData.packageName}</td>
          </tr>
          <tr>
            <td>充值积分</td>
            <td><strong>${testOrderData.credits} 积分</strong></td>
          </tr>
          <tr>
            <td>支付金额</td>
            <td><strong style="color: #28a745; font-size: 18px;">¥${testOrderData.amount.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td>支付时间</td>
            <td>${testOrderData.paidAt}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #28a745;">👤 用户信息</h3>
      <table class="info-table">
        <tr>
          <td>用户名称</td>
          <td>${testOrderData.userName}</td>
        </tr>
        <tr>
          <td>用户邮箱</td>
          <td>${testOrderData.userEmail}</td>
        </tr>
        <tr>
          <td>买家支付宝ID</td>
          <td>${testOrderData.buyerId}</td>
        </tr>
      </table>

      <div style="margin: 30px 0; padding: 20px; background: #d1ecf1; border-left: 4px solid #0c5460; border-radius: 5px;">
        <p style="margin: 0;"><strong>✅ 配置成功！</strong></p>
        <p style="margin: 10px 0 0 0;">
          如果您收到这封邮件，说明：
        </p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>管理员邮箱配置正确</li>
          <li>SMTP服务配置正确</li>
          <li>邮件发送功能正常工作</li>
          <li>当有真实订单时，您会收到类似的通知</li>
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          此邮件由 VEO AI 系统自动发送 | 测试时间: ${testOrderData.paidAt}
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`

// 发送测试邮件
console.log('📧 正在发送测试邮件...\n')
console.log('📨 收件人:', process.env.ADMIN_EMAIL)
console.log('')

try {
  const info = await transporter.sendMail({
    from: `"VEO AI 测试" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `💰 测试 - 新订单支付成功 - ${testOrderData.packageName} - ¥${testOrderData.amount}`,
    html: emailHtml
  })

  console.log('✅ 测试邮件发送成功！')
  console.log('   Message ID:', info.messageId)
  console.log('')
  console.log('🎉 请检查您的管理员邮箱:', process.env.ADMIN_EMAIL)
  console.log('💡 如果没收到，请检查垃圾邮件文件夹')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ 配置成功！当有用户购买套餐时，')
  console.log('   您会收到类似的实时到账通知邮件！')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

} catch (error) {
  console.error('❌ 测试邮件发送失败')
  console.error('   错误:', error.message)
  console.error('')
  console.error('常见问题排查:')
  console.error('1. 检查 SMTP_PASSWORD 是否是QQ邮箱授权码（不是密码）')
  console.error('2. 确认QQ邮箱已开启SMTP服务')
  console.error('3. 尝试重新生成QQ邮箱授权码')
  console.error('4. 检查网络连接是否正常')
  console.error('')
  console.error('详细错误信息:', error)
  process.exit(1)
}


