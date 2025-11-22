/**
 * 测试邮件修复功能
 * 运行方式：node test-email-fixes.js
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

async function testEmailFixes() {
  console.log('🧪 测试邮件修复功能\n')
  console.log('=' .repeat(60))
  
  // 1. 检查环境变量
  console.log('\n📋 环境变量检查:')
  console.log(`   ADMIN_EMAIL: ${process.env.ADMIN_EMAIL || '❌ 未配置'}`)
  console.log(`   SMTP_USER: ${process.env.SMTP_USER || '❌ 未配置'}`)
  console.log(`   SMTP_PASSWORD: ${process.env.SMTP_PASSWORD ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`   SMTP_HOST: ${process.env.SMTP_HOST || '❌ 未配置'}`)
  console.log(`   SMTP_PORT: ${process.env.SMTP_PORT || '❌ 未配置'}`)
  
  if (!process.env.ADMIN_EMAIL || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.error('\n❌ 错误: 邮件配置不完整')
    console.log('\n请确保在 .env 文件中配置了以下变量:')
    console.log('  - ADMIN_EMAIL=你的管理员邮箱')
    console.log('  - SMTP_USER=你的SMTP用户名')
    console.log('  - SMTP_PASSWORD=你的SMTP密码/授权码')
    process.exit(1)
  }
  
  console.log('\n' + '=' .repeat(60))
  
  try {
    // 使用tsx来运行TypeScript文件
    const { EmailService } = await import('./src/lib/email.js')
    
    // 2. 测试用户购买成功邮件（不显示积分消耗）
    console.log('\n📧 测试1: 用户购买成功邮件（已移除积分消耗信息）')
    console.log('   收件人:', process.env.SMTP_USER)
    
    const userEmailResult = await EmailService.sendPurchaseSuccess({
      email: process.env.SMTP_USER,
      userName: '测试用户',
      packageName: '基础套餐',
      credits: 50,
      expiresAt: '2025-02-22',
      amount: 49.00
    })
    
    if (userEmailResult.success) {
      console.log('   ✅ 用户邮件发送成功')
      console.log('   📨 请检查邮箱，确认邮件中没有"每个视频消耗 15 积分"')
    } else {
      console.log('   ❌ 用户邮件发送失败:', userEmailResult.error)
    }
    
    console.log('\n' + '-'.repeat(60))
    
    // 3. 测试管理员订单通知邮件（增强的错误处理）
    console.log('\n📧 测试2: 管理员订单通知邮件（增强的日志记录）')
    console.log('   收件人:', process.env.ADMIN_EMAIL)
    
    const adminEmailResult = await EmailService.sendAdminOrderNotification({
      orderNumber: 'TEST' + Date.now(),
      userName: '测试用户',
      userEmail: 'test@example.com',
      packageName: '基础套餐',
      credits: 50,
      amount: 49.00,
      buyerId: '2088123456789012',
      alipayTradeNo: '2025' + Date.now(),
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
    
    if (adminEmailResult.success) {
      console.log('   ✅ 管理员邮件发送成功')
      console.log('   📨 Message ID:', adminEmailResult.messageId)
    } else {
      console.log('   ❌ 管理员邮件发送失败:', adminEmailResult.error)
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('\n🎉 测试完成！')
    console.log('\n💡 请检查以下邮箱:')
    console.log(`   - 用户邮箱: ${process.env.SMTP_USER}`)
    console.log(`   - 管理员邮箱: ${process.env.ADMIN_EMAIL}`)
    console.log('\n⚠️  如果没收到邮件，请检查垃圾邮件文件夹')
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message)
    console.error('\n常见问题排查:')
    console.error('1. 检查 SMTP_PASSWORD 是否是QQ邮箱授权码（不是密码）')
    console.error('2. 确认QQ邮箱已开启SMTP服务')
    console.error('3. 检查网络连接是否正常')
    console.error('4. 查看上面的详细错误日志')
  }
}

testEmailFixes()
