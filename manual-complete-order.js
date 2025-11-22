/**
 * 手动完成订单 - 直接操作数据库
 * 用于紧急处理支付成功但回调未到达的订单
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

async function manualCompleteOrder() {
  // 要处理的订单号
  const orderNumber = 'VEO1763794957948N5O5C2'
  
  console.log('🚀 开始手动完成订单...\n')
  console.log('订单号:', orderNumber)
  console.log('')
  
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // 1. 查询订单
    console.log('📋 查询订单信息...')
    const orderResult = await client.query(
      `SELECT 
        co.*,
        u.email as user_email,
        u.name as user_name,
        cp.name as package_name,
        cp.credits as package_credits
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      WHERE co.order_number = $1`,
      [orderNumber]
    )
    
    if (orderResult.rows.length === 0) {
      console.error('❌ 订单不存在')
      await client.query('ROLLBACK')
      process.exit(1)
    }
    
    const order = orderResult.rows[0]
    
    console.log('   订单号:', order.order_number)
    console.log('   用户:', order.user_email)
    console.log('   套餐:', order.package_name)
    console.log('   积分:', order.package_credits)
    console.log('   金额:', order.payment_amount)
    console.log('   当前状态:', order.status)
    console.log('')
    
    // 2. 检查订单状态
    if (order.status === 'PAID' || order.status === 'COMPLETED') {
      console.log('⚠️  订单已处理，无需重复操作')
      await client.query('ROLLBACK')
      process.exit(0)
    }
    
    // 3. 更新订单状态
    console.log('📝 更新订单状态为 PAID...')
    await client.query(
      `UPDATE credit_orders 
       SET status = 'PAID', 
           payment_time = NOW(),
           updated_at = NOW()
       WHERE order_number = $1`,
      [orderNumber]
    )
    console.log('   ✅ 订单状态已更新')
    console.log('')
    
    // 4. 计算过期时间
    let validityDays = 30
    if (order.package_name.includes('新手')) validityDays = 7
    if (order.package_name.includes('专业')) validityDays = 90
    if (order.package_name.includes('企业')) validityDays = 180
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validityDays)
    
    // 5. 充值积分
    console.log('💎 充值积分...')
    await client.query(
      `INSERT INTO user_credit_accounts (
        user_id, available_credits, total_credits, used_credits, frozen_credits,
        package_expires_at, is_expired, package_name,
        created_at, updated_at
      )
       VALUES ($1, $2, $2, 0, 0, $3, false, $4, NOW(), NOW())
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         available_credits = user_credit_accounts.available_credits + $2,
         total_credits = user_credit_accounts.total_credits + $2,
         package_expires_at = $3,
         is_expired = false,
         package_name = $4,
         updated_at = NOW()`,
      [order.user_id, order.package_credits, expiresAt, order.package_name]
    )
    console.log(`   ✅ ${order.package_credits}积分已到账`)
    console.log('')
    
    // 6. 记录积分交易
    console.log('📊 记录积分交易...')
    await client.query(
      `INSERT INTO credit_transactions (
        user_id, transaction_type, credit_amount, description, 
        balance_before, balance_after, 
        related_order_id, created_at
      )
      SELECT
        $1, 'PURCHASE', $2, $3,
        COALESCE(uca.available_credits, 0) - $2,
        COALESCE(uca.available_credits, 0),
        $4, NOW()
      FROM user_credit_accounts uca
      WHERE uca.user_id = $1`,
      [
        order.user_id,
        order.package_credits,
        `手动完成订单 - 购买${order.package_name}`,
        order.id
      ]
    )
    console.log('   ✅ 交易记录已创建')
    console.log('')
    
    // 7. 提交事务
    await client.query('COMMIT')
    
    console.log('🎉 订单处理完成！')
    console.log('')
    console.log('━'.repeat(60))
    console.log('订单详情:')
    console.log(`   订单号: ${order.order_number}`)
    console.log(`   用户: ${order.user_email}`)
    console.log(`   套餐: ${order.package_name}`)
    console.log(`   积分: ${order.package_credits}`)
    console.log(`   有效期至: ${expiresAt.toLocaleDateString('zh-CN')}`)
    console.log('━'.repeat(60))
    console.log('')
    console.log('✅ 用户现在可以使用积分了！')
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ 处理失败:', error.message)
    console.error(error)
  } finally {
    client.release()
    await pool.end()
  }
}

manualCompleteOrder()
