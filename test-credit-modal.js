/**
 * 测试积分弹窗功能
 * 验证API返回的数据格式和弹窗触发逻辑
 */

async function testCreditModal() {
  console.log('🧪 开始测试积分弹窗功能...\n')

  // 测试1: 检查API返回的数据格式
  console.log('📋 测试1: 检查API数据格式')
  console.log('请在浏览器中：')
  console.log('1. 登录系统')
  console.log('2. 打开浏览器开发者工具 (F12)')
  console.log('3. 切换到 Console 标签')
  console.log('4. 执行以下代码：\n')
  
  console.log(`
fetch('/api/user/credits')
  .then(res => res.json())
  .then(data => {
    console.log('API返回数据:', data)
    console.log('账户信息:', data.data?.account)
    console.log('可用积分:', data.data?.account?.available_credits)
  })
  `)

  console.log('\n' + '='.repeat(60) + '\n')

  // 测试2: 手动触发弹窗
  console.log('📋 测试2: 手动触发弹窗')
  console.log('在生成页面的浏览器控制台中执行：\n')
  
  console.log(`
// 检查hook状态
console.log('当前积分:', window.__creditInfo)

// 手动设置低积分状态（仅用于测试）
// 注意：这需要在React DevTools中操作
  `)

  console.log('\n' + '='.repeat(60) + '\n')

  // 测试3: 检查弹窗组件
  console.log('📋 测试3: 检查弹窗组件渲染')
  console.log('在浏览器中：')
  console.log('1. 打开 React DevTools')
  console.log('2. 搜索 "CreditLowModal" 组件')
  console.log('3. 检查 props:')
  console.log('   - credits: 应该是数字')
  console.log('   - isOpen: 应该是 true 才显示')
  console.log('   - onClose: 应该是函数')

  console.log('\n' + '='.repeat(60) + '\n')

  // 测试4: 调试建议
  console.log('🔍 调试建议：')
  console.log('\n1. 在 use-credit-monitor.ts 中添加更多日志：')
  console.log(`
// 在 fetchCredits 函数中添加
console.log('🔍 API响应:', data)
console.log('🔍 解析后的积分:', credits)
console.log('🔍 是否显示弹窗:', credits < 10 && credits > 0 && !hasShownModal)
  `)

  console.log('\n2. 在 CreditLowModal 组件中添加日志：')
  console.log(`
// 在组件顶部添加
useEffect(() => {
  console.log('🔍 弹窗状态:', { credits, isOpen })
}, [credits, isOpen])
  `)

  console.log('\n3. 检查是否有CSS问题导致弹窗不可见：')
  console.log('   - 检查 z-index 是否足够高')
  console.log('   - 检查是否被其他元素遮挡')
  console.log('   - 检查 AnimatePresence 是否正常工作')

  console.log('\n' + '='.repeat(60) + '\n')

  // 测试5: 快速修复方案
  console.log('⚡ 快速修复方案：')
  console.log('\n如果想立即测试弹窗显示效果，可以：')
  console.log('1. 临时修改触发条件（在 use-credit-monitor.ts）：')
  console.log(`
// 将条件改为总是触发（仅用于测试）
if (credits >= 0 && !hasShownModal) {
  setShowLowCreditModal(true)
  setHasShownModal(true)
  console.log('🔔 触发积分不足弹窗，当前积分:', credits)
}
  `)

  console.log('\n2. 或者在生成页面添加一个测试按钮：')
  console.log(`
<Button onClick={() => setShowLowCreditModal(true)}>
  测试弹窗
</Button>
  `)

  console.log('\n✅ 测试指南完成！')
  console.log('请按照上述步骤进行调试。')
}

testCreditModal()
