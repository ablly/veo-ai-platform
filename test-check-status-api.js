/**
 * 测试订单状态查询接口
 */

// 测试最近的订单
const testOrderNumbers = [
  'VEO176379561222395NQ4V',  // 最新的订单
  'VEO1763795543470QZOVHB',
]

async function testCheckStatus() {
  console.log('🧪 测试订单状态查询接口\n')
  
  for (const orderNumber of testOrderNumbers) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`测试订单: ${orderNumber}`)
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    
    try {
      const url = `https://www.veo-ai.site/api/payment/alipay/check-status?out_trade_no=${orderNumber}`
      console.log(`📡 请求URL: ${url}\n`)
      
      const response = await fetch(url)
      const data = await response.json()
      
      console.log(`📊 响应状态: ${response.status}`)
      console.log(`📦 响应数据:`)
      console.log(JSON.stringify(data, null, 2))
      
      if (data.success) {
        console.log('\n✅ 接口调用成功')
        console.log(`   订单状态: ${data.order.status}`)
        console.log(`   套餐名称: ${data.order.packageName}`)
        console.log(`   积分数量: ${data.order.credits}`)
        console.log(`   支付金额: ¥${data.order.amount}`)
      } else {
        console.log('\n❌ 接口返回失败')
        console.log(`   错误信息: ${data.message}`)
      }
      
    } catch (error) {
      console.error('\n❌ 请求失败:', error.message)
    }
  }
}

testCheckStatus()
