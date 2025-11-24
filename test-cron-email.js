/**
 * 测试邮件自动化 Cron 任务
 * 手动触发邮件发送，验证功能是否正常
 */

const CRON_SECRET = '1f41d2719d12005f0fafdc01f02897ff8f3c1c0e6014b669cd13e64abac8782b'

// 本地测试
const LOCAL_URL = 'http://localhost:3000'
// 生产环境
const PROD_URL = 'https://your-domain.vercel.app' // 替换为你的实际域名

async function testCronEmail(useProduction = false) {
  const baseUrl = useProduction ? PROD_URL : LOCAL_URL
  const url = `${baseUrl}/api/cron/email-automation`

  console.log('🧪 测试邮件自动化 Cron 任务...')
  console.log('📍 URL:', url)
  console.log('🔑 使用 CRON_SECRET 认证\n')

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    console.log('📊 响应状态:', response.status)
    console.log('📦 响应数据:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('\n✅ Cron 任务执行成功！')
      console.log('\n📧 发送统计:')
      console.log(`  - 积分不足提醒: ${data.results.creditLow} 封`)
      console.log(`  - 积分用完提醒: ${data.results.creditEmpty} 封`)
      console.log(`  - 首单特惠邮件: ${data.results.firstPurchaseOffer} 封`)
      console.log(`  - 最后提醒邮件: ${data.results.lastChanceOffer} 封`)
      
      if (data.results.errors && data.results.errors.length > 0) {
        console.log('\n⚠️ 错误信息:')
        data.results.errors.forEach(err => console.log(`  - ${err}`))
      }
    } else {
      console.log('\n❌ Cron 任务执行失败')
      console.log('错误:', data.error)
    }

  } catch (error) {
    console.error('\n❌ 请求失败:', error.message)
    
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 提示:')
      console.log('  1. 确保开发服务器正在运行: npm run dev')
      console.log('  2. 或者使用生产环境测试: node test-cron-email.js prod')
    }
  }
}

// 检查命令行参数
const args = process.argv.slice(2)
const useProduction = args.includes('prod') || args.includes('production')

if (useProduction) {
  console.log('⚠️ 注意: 使用生产环境测试')
  console.log('请确保已将 PROD_URL 替换为实际域名\n')
}

testCronEmail(useProduction)
