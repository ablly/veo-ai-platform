/**
 * Resend快速测试脚本
 * 自动使用注册邮箱测试
 */

require('dotenv').config({ path: '.env' })

async function testResend() {
  console.log('🧪 开始测试Resend邮件服务...\n')

  // 检查环境变量
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ 错误: RESEND_API_KEY 未配置')
    process.exit(1)
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'VEO AI <onboarding@resend.dev>'
    const toEmail = 'zhouablly@gmail.com' // 你的Resend注册邮箱

    console.log(`📤 正在发送测试邮件...`)
    console.log(`   发件人: ${fromEmail}`)
    console.log(`   收件人: ${toEmail}`)
    console.log('')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: '🎉 VEO AI 邮件服务测试成功',
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
              padding: 40px 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { 
              background: #d4edda;
              padding: 20px; 
              margin: 20px 0; 
              border-radius: 8px; 
              border-left: 4px solid #28a745;
            }
            .info-box {
              background: white;
              padding: 15px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #667eea;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎉 测试成功！</h1>
              <p style="margin: 10px 0 0 0;">VEO AI 邮件服务正常运行</p>
            </div>
            <div class="content">
              <div class="success-box">
                <h3 style="margin-top: 0; color: #28a745;">✅ 邮件服务配置成功</h3>
                <p>恭喜！如果您收到这封邮件，说明Resend邮件服务已经正确配置并可以正常发送邮件。</p>
              </div>

              <h3>📋 配置信息</h3>
              <div class="info-box">
                <p><strong>发件人:</strong> ${fromEmail}</p>
                <p><strong>收件人:</strong> ${toEmail}</p>
                <p><strong>发送时间:</strong> ${new Date().toLocaleString('zh-CN')}</p>
                <p><strong>服务:</strong> Resend</p>
              </div>

              <h3>🚀 下一步</h3>
              <div class="info-box">
                <p><strong>重要提示：</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>免费账号只能发送到注册邮箱（${toEmail}）</li>
                  <li>要发送到其他邮箱，需要验证自定义域名</li>
                  <li>验证域名后可以发送到任何邮箱</li>
                </ul>
              </div>

              <h3>📝 如何验证域名</h3>
              <div class="info-box">
                <ol style="margin: 10px 0; padding-left: 20px;">
                  <li>登录 <a href="https://resend.com/domains">Resend Domains</a></li>
                  <li>点击 "Add Domain" 添加 veo-ai.site</li>
                  <li>按照指引添加DNS记录（SPF、DKIM）</li>
                  <li>等待验证通过（5-30分钟）</li>
                  <li>修改 RESEND_FROM_EMAIL 为 VEO AI &lt;noreply@veo-ai.site&gt;</li>
                </ol>
              </div>

              <p style="margin-top: 30px; color: #999; font-size: 12px; text-align: center;">
                VEO AI - 让创意生动起来
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('❌ 发送失败:', error)
      process.exit(1)
    }

    console.log('✅ 邮件发送成功!')
    console.log(`   Message ID: ${data.id}`)
    console.log('')
    console.log('📊 查看发送状态:')
    console.log(`   https://resend.com/emails/${data.id}`)
    console.log('')
    console.log('💡 提示:')
    console.log('   1. 请检查邮箱: zhouablly@gmail.com')
    console.log('   2. 如果没收到，查看垃圾邮件文件夹')
    console.log('   3. 要发送到其他邮箱，需要验证域名 veo-ai.site')
    console.log('')

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

testResend()
