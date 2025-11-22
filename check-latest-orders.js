/**
 * 查看最新的订单
 */

require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

async function checkLatestOrders() {
  console.log('🔍 查询最新的10个订单...\n')
  
  try {
    const result = await pool.query(
      `SELECT 
        co.order_number,
        co.status,
        co.payment_amount,
        co.payment_method,
        co.created_at,
        co.payment_time,
        u.email as user_email,
        cp.name as package_name,
        cp.credits
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      ORDER BY co.created_at DESC
      LIMIT 10`
    )
    
    if (result.rows.length === 0) {
      console.log('❌ 没有找到任何订单')
      process.exit(1)
    }
    
    console.log(`找到 ${result.rows.length} 个订单:\n`)
    console.log('━'.repeat(120))
    
    result.rows.forEach((order, index) => {
      console.log(`\n${index + 1}. 订单号: ${order.order_number}`)
      console.log(`   状态: ${order.status}`)
      console.log(`   用户: ${order.user_email}`)
      console.log(`   套餐: ${order.package_name} (${order.credits}积分)`)
      console.log(`   金额: ¥${order.payment_amount}`)
      console.log(`   支付方式: ${order.payment_method}`)
      console.log(`   创建时间: ${order.created_at}`)
      console.log(`   支付时间: ${order.payment_time || '未支付'}`)
    })
    
    console.log('\n' + '━'.repeat(120))
    console.log('\n💡 如果您的订单在上面，请记下订单号')
    console.log('   然后修改 check-order-and-send-email.js 中的订单号重新运行')
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

checkLatestOrders()
