/**
 * 测试 Supabase Key 是否有效
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseKey() {
  console.log('🔍 测试 Supabase 连接...\n')
  
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  
  console.log('📋 配置信息:')
  console.log('  URL:', url)
  console.log('  Key 长度:', serviceKey?.length)
  console.log('  Key 开头:', serviceKey?.substring(0, 30))
  console.log('  Key 结尾:', serviceKey?.substring(serviceKey.length - 30))
  console.log()
  
  try {
    const supabase = createClient(url, serviceKey)
    
    console.log('🔍 测试 RPC 函数调用...')
    const { data, error } = await supabase.rpc('get_empty_credit_users', { days_ago: 7 })
    
    if (error) {
      console.error('❌ RPC 调用失败:')
      console.error('  错误信息:', error.message)
      console.error('  错误详情:', error)
      process.exit(1)
    }
    
    console.log('✅ RPC 调用成功!')
    console.log(`  找到 ${data?.length || 0} 个用户`)
    
    if (data && data.length > 0) {
      console.log('\n📧 用户列表:')
      data.slice(0, 3).forEach((user, i) => {
        console.log(`  ${i + 1}. ${user.email} (积分: ${user.available_credits})`)
      })
    }
    
    console.log('\n✅ 测试通过！Key 是有效的。')
    
  } catch (error) {
    console.error('\n💥 测试失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

testSupabaseKey()
