/**
 * SMTP连接测试脚本
 * 用于测试QQ邮箱SMTP配置是否正确
 */

const nodemailer = require('nodemailer')
require('dotenv').config()

console.log('🔍 开始测试SMTP连接...\n')

// 显示当前配置（隐藏密码）
console.log('📋 当前SMTP配置：')
console.log('  主机:', process.env.SMTP_HOST)
console.log('  端口:', process.env.SMTP_PORT)
console.log('  安全连接:', process.env.SMTP_SECURE)
console.log('  用户:', process.env.SMTP_USER)
console.log('  密码:', process.env.SMTP_PASSWORD ? '***已设置***' : '❌ 未设置')
console.log('')

if (!process.env.SMTP_PASSWORD) {
  console.error('❌ 错误：SMTP_PASSWORD 未设置！')
  console.log('\n请在 .env 文件中设置 SMTP_PASSWORD')
  process.exit(1)
}

// 创建传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.qq.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
})

async function testConnection() {
  try {
    console.log('🔌 正在连接SMTP服务器...')
    
    // 验证连接
    await transporter.verify()
    
    console.log('✅ SMTP服务器连接成功！\n')
    
    // 发送测试邮件
    console.log('📧 正在发送测试邮件...')
    
    const info = await transporter.sendMail({
      from: `"VEO AI 测试" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // 发送给自己
      subject: '✅ SMTP配置测试成功',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: #f9f9f9; 
              padding: 30px; 
              border-radius: 0 0 10px 10px; 
            }
            .success-box {
              background: #d4edda;
              border: 1px solid #c3e6cb;
              color: #155724;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .info-box {
              background: #d1ecf1;
              border: 1px solid #bee5eb;
              color: #0c5460;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ SMTP配置测试成功</h1>
              <p>VEO AI 邮件系统</p>
            </div>
            <div class="content">
              <div class="success-box">
                <h3>🎉 恭喜！</h3>
                <p>您的SMTP配置已经正确设置，邮件系统可以正常工作了！</p>
              </div>
              
              <div class="info-box">
                <h3>📋 配置信息</h3>
                <ul>
                  <li><strong>SMTP主机：</strong>${process.env.SMTP_HOST}</li>
                  <li><strong>SMTP端口：</strong>${process.env.SMTP_PORT}</li>
                  <li><strong>发件邮箱：</strong>${process.env.SMTP_USER}</li>
                  <li><strong>测试时间：</strong>${new Date().toLocaleString('zh-CN')}</li>
                </ul>
              </div>
              
              <p><strong>下一步：</strong></p>
              <ul>
                <li>✅ 您现在可以在管理后台发送邮件了</li>
                <li>✅ 访问 /admin/notifications 开始发送</li>
                <li>✅ 所有邮件通知功能都已就绪</li>
              </ul>
              
              <p style="margin-top: 30px; color: #666; font-size: 12px;">
                此邮件由SMTP测试脚本自动发送<br>
                VEO AI - 让创意生动起来
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
    
    console.log('✅ 测试邮件发送成功！\n')
    console.log('📬 邮件详情：')
    console.log('  Message ID:', info.messageId)
    console.log('  收件人:', process.env.SMTP_USER)
    console.log('  主题: ✅ SMTP配置测试成功')
    console.log('')
    console.log('🎉 SMTP配置完全正常！')
    console.log('💡 现在您可以在管理后台发送邮件了')
    console.log('👉 访问: http://localhost:3000/admin/notifications')
    
  } catch (error) {
    console.error('\n❌ 测试失败！\n')
    console.error('错误类型:', error.name)
    console.error('错误信息:', error.message)
    console.error('')
    
    // 提供具体的解决建议
    if (error.message.includes('Invalid login') || error.message.includes('535')) {
      console.log('🔧 解决方案：')
      console.log('1. 登录QQ邮箱网页版: https://mail.qq.com')
      console.log('2. 进入"设置" → "账户"')
      console.log('3. 找到"POP3/IMAP/SMTP服务"')
      console.log('4. 确保SMTP服务已开启')
      console.log('5. 点击"生成授权码"')
      console.log('6. 将新的授权码更新到 .env 文件的 SMTP_PASSWORD')
      console.log('7. 重启服务器并重新测试')
      console.log('')
      console.log('📖 详细教程: 查看 FIX_EMAIL_SMTP_ERROR.md')
    } else if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
      console.log('🔧 解决方案：')
      console.log('1. 检查网络连接')
      console.log('2. 确认防火墙没有阻止SMTP端口（465）')
      console.log('3. 尝试使用VPN或更换网络')
    } else {
      console.log('🔧 建议：')
      console.log('1. 检查 .env 文件中的SMTP配置')
      console.log('2. 确认授权码没有多余的空格或引号')
      console.log('3. 查看详细教程: FIX_EMAIL_SMTP_ERROR.md')
    }
    
    console.log('')
    console.error('完整错误信息:')
    console.error(error)
  }
}

// 运行测试
testConnection()
