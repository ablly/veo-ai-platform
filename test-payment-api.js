/**
 * 测试支付接口
 */

async function testPaymentAPIs() {
  console.log('🧪 测试支付接口\n')
  
  // 测试支付宝创建订单接口
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('1. 测试支付宝创建订单接口')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    const alipayUrl = 'https://www.veo-ai.site/api/payment/alipay/create-order'
    console.log(`📡 请求URL: ${alipayUrl}`)
    console.log(`📦 请求方法: POST`)
    console.log(`📦 请求体: { packageId: "cc2e44bf-5173-4a8f-9fcf-6e8a4fd79fc9" }\n`)
    
    const alipayResponse = await fetch(alipayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // 模拟登录
      },
      body: JSON.stringify({
        packageId: 'cc2e44bf-5173-4a8f-9fcf-6e8a4fd79fc9' // 新手体验套餐ID
      })
    })
    
    console.log(`📊 响应状态: ${alipayResponse.status}`)
    const alipayData = await alipayResponse.json()
    console.log(`📦 响应数据:`)
    console.log(JSON.stringify(alipayData, null, 2))
    
    if (alipayData.success) {
      console.log('\n✅ 支付宝接口正常')
    } else {
      console.log('\n❌ 支付宝接口返回错误')
      console.log(`   错误信息: ${alipayData.message}`)
    }
  } catch (error) {
    console.error('\n❌ 支付宝接口请求失败:', error.message)
  }
  
  // 测试Stripe创建订单接口
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('2. 测试Stripe创建订单接口')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    const stripeUrl = 'https://www.veo-ai.site/api/payment/stripe/create-checkout'
    console.log(`📡 请求URL: ${stripeUrl}`)
    console.log(`📦 请求方法: POST`)
    console.log(`📦 请求体: { packageId: "cc2e44bf-5173-4a8f-9fcf-6e8a4fd79fc9" }\n`)
    
    const stripeResponse = await fetch(stripeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=test' // 模拟登录
      },
      body: JSON.stringify({
        packageId: 'cc2e44bf-5173-4a8f-9fcf-6e8a4fd79fc9' // 新手体验套餐ID
      })
    })
    
    console.log(`📊 响应状态: ${stripeResponse.status}`)
    const stripeData = await stripeResponse.json()
    console.log(`📦 响应数据:`)
    console.log(JSON.stringify(stripeData, null, 2))
    
    if (stripeData.success) {
      console.log('\n✅ Stripe接口正常')
    } else {
      console.log('\n❌ Stripe接口返回错误')
      console.log(`   错误信息: ${stripeData.message}`)
    }
  } catch (error) {
    console.error('\n❌ Stripe接口请求失败:', error.message)
  }
}

testPaymentAPIs()
