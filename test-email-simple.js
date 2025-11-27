/**
 * 简单的邮件测试脚本
 * 用法：node test-email-simple.js your-email@example.com
 */

require('dotenv').config()
const { Resend } = require('resend')

const resend = new Resend(process.env.RESEND_API_KEY)

// 优化后的邮件模板（直接内联）
const emailStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
  .container { max-width: 600px; margin: 20px auto; background: white; }
  .header { background: #4a5568; color: white; padding: 20px 30px; }
  .content { padding: 30px; }
  .info-box { background: #f7fafc; padding: 20px; margin: 20px 0; border-left: 3px solid #4a5568; }
  .link { color: #4a5568; text-decoration: none; }
  .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; border-top: 1px solid #e2e8f0; }
`

const creditEmptyEmailHTML = (userName) => `
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
      <p>您好，${userName}</p>
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
        <a href="https://www.veo-ai.site/pricing" class="link">查看套餐选项</a>
      </p>

      <p style="margin-top: 30px; color: #718096; font-size: 14px;">
        这是一封自动发送的系统通知邮件。
      </p>
    </div>
    <div class="footer">
      <p>VEO AI 视频生成平台</p>
      <p><a href="https://www.veo-ai.site/profile" style="color: #718096;">管理邮件偏好</a></p>
    </div>
  </div>
</body>
</html>
`

async function testEmail(toEmail) {
  console.log('📧 开始测试优化后的邮件...\n')
  console.log(`收件人: ${toEmail}\n`)

  try {
    const result = await resend.emails.send({
      from: 'VEO AI <noreply@veo-ai.site>',
      to: toEmail,
      subject: '【VEO AI】账户积分已用完',
      html: creditEmptyEmailHTML('测试用户')
    })

    if (result.data) {
      console.log('✅ 邮件发送成功!')
      console.log(`   Message ID: ${result.data.id}`)
      console.log('\n📋 下一步:')
      console.log('1. 检查收件箱（可能需要等待 1-2 分钟）')
      console.log('2. 如果没收到，检查垃圾邮件文件夹')
      console.log('3. 查看 Resend 控制台: https://resend.com/emails')
      console.log('\n💡 对比优化前后:')
      console.log('   优化前: 大量 emoji、"限时优惠"、彩色按钮')
      console.log('   优化后: 简洁专业、系统通知风格')
    } else if (result.error) {
      console.log('❌ 发送失败:', result.error)
    }

  } catch (error) {
    console.log('❌ 发送失败:', error.message)
  }
}

// 获取命令行参数
const toEmail = process.argv[2]

if (!toEmail) {
  console.log('❌ 请提供收件人邮箱地址')
  console.log('\n用法:')
  console.log('  node test-email-simple.js your-email@example.com')
  process.exit(1)
}

// 运行测试
testEmail(toEmail).catch(console.error)
