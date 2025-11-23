/**
 * Resend邮件发送测试脚本
 * 用于测试邮件服务是否正常工作
 */

require('dotenv').config({ path: '.env' })

async function testResendEmail() {
  console.log('🧪 开始测试Resend邮件服务...\n')

  // 检查环境变量
  console.log('📋 检查环境变量:')
  console.log('   RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ 已配置' : '❌ 未配置')
  console.log('   RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || '❌ 未配置')
  console.log('')

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ 错误: RESEND_API_KEY 未配置')
    console.log('\n请在 .env 文件中添加:')
    console.log('RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx')
    process.exit(1)
  }

  try {
    const { Resend } = require('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'VEO AI <onboarding@resend.dev>'
    
    // 提示输入收件人邮箱
    const readline = require('readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('📧 请输入测试邮箱地址: ', async (toEmail) => {
      rl.close()

      if (!toEmail || !toEmail.includes('@')) {
        console.error('❌ 无效的邮箱地址')
        process.exit(1)
      }

      console.log(`\n📤 正在发送测试邮件到: ${toEmail}`)
      console.log(`   发件人: ${fromEmail}`)
      console.log('')

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: '🎉 VEO AI 邮件服务测试',
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
                  <p>如果您收到这封邮件，说明Resend邮件服务已经正确配置并可以正常发送邮件。</p>
                </div>

                <h3>📋 测试信息</h3>
                <ul>
                  <li><strong>发件人:</strong> ${fromEmail}</li>
                  <li><strong>收件人:</strong> ${toEmail}</li>
                  <li><strong>发送时间:</strong> ${new Date().toLocaleString('zh-CN')}</li>
                  <li><strong>服务:</strong> Resend</li>
                </ul>

                <h3>🚀 下一步</h3>
                <p>现在您可以：</p>
                <ul>
                  <li>部署到生产环境</li>
                  <li>配置自定义域名（提高送达率）</li>
                  <li>启用邮件营销自动化</li>
                  <li>监控邮件发送统计</li>
                </ul>

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
      console.log('💡 提示: 请检查您的邮箱（包括垃圾邮件文件夹）')
      console.log('')
    })

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    process.exit(1)
  }
}

testResendEmail()
