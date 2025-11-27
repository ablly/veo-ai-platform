/**
 * 测试优化后的邮件模板
 * 用法：node test-optimized-email.js your-email@example.com
 */

require('dotenv').config()
const { Resend } = require('resend')

// 导入邮件模板（使用编译后的 JS）
const { 
  creditLowEmail, 
  creditEmptyEmail,
  firstPurchaseOfferEmail,
  lastChanceOfferEmail,
  welcomeEmail
} = require('./src/lib/email-templates/marketing-templates')

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail(toEmail, templateType = 'all') {
  console.log('📧 开始测试邮件发送...\n')
  console.log(`收件人: ${toEmail}`)
  console.log(`模板类型: ${templateType}\n`)

  const testData = {
    userName: '测试用户',
    credits: 5
  }

  const templates = {
    welcome: () => welcomeEmail({ userName: testData.userName, credits: 10 }),
    creditLow: () => creditLowEmail(testData),
    creditEmpty: () => creditEmptyEmail({ userName: testData.userName }),
    firstOffer: () => firstPurchaseOfferEmail(testData),
    lastChance: () => lastChanceOfferEmail({ userName: testData.userName })
  }

  const templatesToTest = templateType === 'all' 
    ? Object.keys(templates)
    : [templateType]

  for (const type of templatesToTest) {
    if (!templates[type]) {
      console.log(`❌ 未知的模板类型: ${type}`)
      continue
    }

    try {
      const template = templates[type]()
      console.log(`\n📤 发送 ${type} 邮件...`)
      console.log(`   主题: ${template.subject}`)

      const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'VEO AI <noreply@veo-ai.site>',
        to: toEmail,
        subject: `[测试] ${template.subject}`,
        html: template.html
      })

      if (result.data) {
        console.log(`✅ 发送成功!`)
        console.log(`   Message ID: ${result.data.id}`)
      } else if (result.error) {
        console.log(`❌ 发送失败:`, result.error)
      }

      // 等待 1 秒避免速率限制
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.log(`❌ 发送失败:`, error.message)
    }
  }

  console.log('\n✅ 测试完成!')
  console.log('\n📋 下一步:')
  console.log('1. 检查收件箱（可能需要等待几分钟）')
  console.log('2. 检查垃圾邮件文件夹')
  console.log('3. 查看 Resend 控制台: https://resend.com/emails')
}

// 获取命令行参数
const args = process.argv.slice(2)
const toEmail = args[0]
const templateType = args[1] || 'all'

if (!toEmail) {
  console.log('❌ 请提供收件人邮箱地址')
  console.log('\n用法:')
  console.log('  node test-optimized-email.js your-email@example.com')
  console.log('  node test-optimized-email.js your-email@example.com creditEmpty')
  console.log('\n可用的模板类型:')
  console.log('  - all (默认，发送所有模板)')
  console.log('  - welcome')
  console.log('  - creditLow')
  console.log('  - creditEmpty')
  console.log('  - firstOffer')
  console.log('  - lastChance')
  process.exit(1)
}

// 运行测试
testEmail(toEmail, templateType).catch(console.error)
