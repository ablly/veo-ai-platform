require('dotenv').config()
const {Pool}=require('pg')
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}})

// 从Vercel日志中看到的订单号
const orderNumbers = [
  'VEO1763795612223P9K4V',  // 15:13
  'VEO1763796612223P9K4V',  // 如果有的话
]

async function checkOrders() {
  console.log('🔍 检查订单状态...\n')
  
  for (const orderNumber of orderNumbers) {
    try {
      const result = await pool.query(
        `SELECT order_number, status, payment_time, created_at 
         FROM credit_orders 
         WHERE order_number = $1`,
        [orderNumber]
      )
      
      if (result.rows.length > 0) {
        const order = result.rows[0]
        console.log(`订单号: ${order.order_number}`)
        console.log(`  状态: ${order.status}`)
        console.log(`  创建时间: ${order.created_at}`)
        console.log(`  支付时间: ${order.payment_time || '未支付'}`)
        console.log('')
      }
    } catch (e) {
      // 订单不存在，跳过
    }
  }
  
  // 查看最新的5个订单
  const latest = await pool.query(
    `SELECT order_number, status, payment_time, created_at 
     FROM credit_orders 
     ORDER BY created_at DESC 
     LIMIT 5`
  )
  
  console.log('最新5个订单:')
  latest.rows.forEach(order => {
    console.log(`  ${order.order_number} - ${order.status} - ${order.created_at}`)
  })
  
  await pool.end()
}

checkOrders()
