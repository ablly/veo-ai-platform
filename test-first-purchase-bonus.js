/**
 * 首单特惠功能测试脚本
 * 
 * 用途：验证首单特惠逻辑是否正确
 */

// 模拟首单特惠计算
function calculateFirstPurchaseBonus(credits, isFirstPurchase) {
  let creditsToAdd = credits
  let bonusCredits = 0
  
  if (isFirstPurchase) {
    bonusCredits = Math.floor(credits * 0.5)
    creditsToAdd = credits + bonusCredits
  }
  
  return {
    originalCredits: credits,
    bonusCredits,
    totalCredits: creditsToAdd,
    isFirstPurchase
  }
}

// 测试用例
const testCases = [
  { credits: 50, isFirstPurchase: true, expected: 75 },
  { credits: 100, isFirstPurchase: true, expected: 150 },
  { credits: 200, isFirstPurchase: true, expected: 300 },
  { credits: 500, isFirstPurchase: true, expected: 750 },
  { credits: 50, isFirstPurchase: false, expected: 50 },
  { credits: 100, isFirstPurchase: false, expected: 100 },
  { credits: 33, isFirstPurchase: true, expected: 49 }, // 33 + 16 = 49
  { credits: 1, isFirstPurchase: true, expected: 1 }, // 1 + 0 = 1 (向下取整)
]

console.log('🧪 首单特惠功能测试\n')
console.log('=' .repeat(80))

let passedTests = 0
let failedTests = 0

testCases.forEach((testCase, index) => {
  const result = calculateFirstPurchaseBonus(testCase.credits, testCase.isFirstPurchase)
  const passed = result.totalCredits === testCase.expected
  
  if (passed) {
    passedTests++
    console.log(`✅ 测试 ${index + 1}: 通过`)
  } else {
    failedTests++
    console.log(`❌ 测试 ${index + 1}: 失败`)
  }
  
  console.log(`   套餐积分: ${testCase.credits}`)
  console.log(`   是否首单: ${testCase.isFirstPurchase ? '是' : '否'}`)
  console.log(`   赠送积分: ${result.bonusCredits}`)
  console.log(`   总计积分: ${result.totalCredits}`)
  console.log(`   期望积分: ${testCase.expected}`)
  console.log(`   结果: ${passed ? '✅ 正确' : '❌ 错误'}`)
  console.log('-'.repeat(80))
})

console.log('\n📊 测试结果汇总')
console.log('=' .repeat(80))
console.log(`总测试数: ${testCases.length}`)
console.log(`通过: ${passedTests} ✅`)
console.log(`失败: ${failedTests} ❌`)
console.log(`成功率: ${((passedTests / testCases.length) * 100).toFixed(2)}%`)

if (failedTests === 0) {
  console.log('\n🎉 所有测试通过！首单特惠逻辑正确！')
} else {
  console.log('\n⚠️ 有测试失败，请检查逻辑！')
}

// 示例场景
console.log('\n\n📝 实际使用场景示例')
console.log('=' .repeat(80))

const scenarios = [
  { name: '新手体验', credits: 5, price: 3.3, priceUSD: 3 },
  { name: '基础套餐', credits: 50, price: 24.5, priceUSD: 10 },
  { name: '专业套餐', credits: 150, price: 49.5, priceUSD: 20 },
  { name: '企业套餐', credits: 500, price: 149.5, priceUSD: 45 },
]

scenarios.forEach(scenario => {
  const firstPurchase = calculateFirstPurchaseBonus(scenario.credits, true)
  const normalPurchase = calculateFirstPurchaseBonus(scenario.credits, false)
  
  console.log(`\n${scenario.name}`)
  console.log(`  国内支付宝: ¥${scenario.price} | 国际Stripe: $${scenario.priceUSD}`)
  console.log(`  首次购买: ${scenario.credits}积分 + ${firstPurchase.bonusCredits}赠送 = ${firstPurchase.totalCredits}积分`)
  console.log(`  再次购买: ${normalPurchase.totalCredits}积分（无赠送）`)
  console.log(`  首单优惠: 多得${firstPurchase.bonusCredits}积分 (${((firstPurchase.bonusCredits / scenario.credits) * 100).toFixed(0)}%)`)
})

console.log('\n\n✨ 测试完成！')
