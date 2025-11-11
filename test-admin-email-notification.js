/**
 * 测试管理员邮件通知功能
 * 运行方式：node test-admin-email-notification.js
 */

// 尝试加载环境变量文件（按优先级）
require('dotenv').config({ path: '.env.local' }) // 优先加载 .env.local
require('dotenv').config({ path: '.env' })       // 如果没有则加载 .env

// 动态导入 ES 模块
async function testAdminEmail() {
  console.log('🧪 开始测试管理员邮件通知...\n')

  // 检查环境变量配置
  console.log('📋 环境变量检查:')
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`   SMTP_USER: ${process.env.SMTP_USER ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ 已配置' : '❌ 未配置'}`)
  console.log('')

  if (!process.env.ADMIN_EMAIL) {
    console.error('❌ 错误: ADMIN_EMAIL 环境变量未配置')
    console.log('请在 .env.local 文件中添加: ADMIN_EMAIL=你的QQ邮箱@qq.com')
    process.exit(1)
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('❌ 错误: SMTP配置不完整')
    console.log('请确保配置了 SMTP_USER 和 SMTP_PASSWORD')
    process.exit(1)
  }

  try {
    // 动态导入邮件服务
    const { EmailService } = await import('./src/lib/email.ts')

    console.log('📧 正在发送测试邮件...\n')
    console.log('📨 收件人:', process.env.ADMIN_EMAIL)
    console.log('')

    // 发送测试邮件
    const result = await EmailService.sendAdminOrderNotification({
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
    })

    if (result.success) {
      console.log('✅ 测试邮件发送成功！')
      console.log('   Message ID:', result.messageId)
      console.log('')
      console.log('🎉 请检查您的管理员邮箱:', process.env.ADMIN_EMAIL)
      console.log('💡 如果没收到，请检查垃圾邮件文件夹')
    } else {
      console.error('❌ 测试邮件发送失败')
      console.error('   错误:', result.error)
    }

  } catch (error) {
    console.error('❌ 测试过程中出错:', error.message)
    console.error('')
    console.error('常见问题排查:')
    console.error('1. 检查 SMTP_PASSWORD 是否是QQ邮箱授权码（不是密码）')
    console.error('2. 确认QQ邮箱已开启SMTP服务')
    console.error('3. 尝试重新生成QQ邮箱授权码')
    console.error('4. 检查网络连接是否正常')
  }
}

// 运行测试
testAdminEmail()

