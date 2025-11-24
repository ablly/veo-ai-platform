/**
 * 直接测试 Cron API
 * 用于调试营销邮件发送问题
 */

const CRON_SECRET = '1f41d2719d12005f0fafdc01f02897ff8f3c1c0e6014b669cd13e64abac8782b'
const VERCEL_URL = 'https://veo-ai-platform-oiyyad74b-zqh.vercel.app' // 替换为你的 Vercel 域名

async function testCron() {
  console.log('🚀 开始测试 Cron API...\n')
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/cron/email-automation`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 响应状态:', response.status, response.statusText)
    console.log('📋 响应头:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    const text = await response.text()
    console.log('\n📄 响应内容:')
    console.log(text)

    if (response.ok) {
      try {
        const data = JSON.parse(text)
        console.log('\n✅ JSON 解析成功:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.success) {
          console.log('\n📈 发送统计:')
          console.log(`  积分不足: ${data.results.creditLow}`)
          console.log(`  积分用完: ${data.results.creditEmpty}`)
          console.log(`  首单特惠: ${data.results.firstPurchaseOffer}`)
          console.log(`  最后提醒: ${data.results.lastChanceOffer}`)
          
          if (data.results.errors && data.results.errors.length > 0) {
            console.log('\n❌ 错误列表:')
            data.results.errors.forEach((err, i) => {
              console.log(`  ${i + 1}. ${err}`)
            })
          }
        }
      } catch (e) {
        console.log('⚠️  无法解析为 JSON')
      }
    } else {
      console.log('\n❌ 请求失败')
    }

  } catch (error) {
    console.error('\n💥 请求错误:', error.message)
    console.error(error)
  }
}

// 运行测试
testCron()
