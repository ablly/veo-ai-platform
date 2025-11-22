require('dotenv').config()
const {Pool}=require('pg')
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}})

async function checkOrder() {
  const orderNumber = 'VEO1763795612223P9K4V'
  
  console.log('🔍 检查订单详情:', orderNumber)
  console.log('')
  
  try {
    // 查询订单
    const orderResult = await pool.query(
      `SELECT * FROM credit_orders WHERE order_number = $1`,
      [orderNumber]
    )
    
    if (orderResult.rows.length === 0) {
      console.log('❌ 订单不存在')
      await pool.end()
      return
    }
    
    const order = orderResult.rows[0]
    console.log('订单信息:')
    console.log('  订单号:', order.order_number)
    console.log('  状态:', order.status)
    console.log('  用户ID:', order.user_id)
    console.log('  套餐ID:', order.package_id)
    console.log('  积分数量:', order.credits_amount)
    console.log('  支付金额:', order.payment_amount)
    console.log('  支付方式:', order.payment_method)
    console.log('  创建时间:', order.created_at)
    console.log('  支付时间:', order.payment_time || '未支付')
    console.log('  更新时间:', order.updated_at)
    console.log('')
    
    // 查询用户积分
    const creditResult = await pool.query(
      `SELECT * FROM user_credit_accounts WHERE user_id = $1`,
      [order.user_id]
    )
    
    if (creditResult.rows.length > 0) {
      const credit = creditResult.rows[0]
      console.log('用户积分:')
      console.log('  可用积分:', credit.available_credits)
      console.log('  总积分:', credit.total_credits)
      console.log('  已使用:', credit.used_credits)
      console.log('  冻结:', credit.frozen_credits)
      console.log('  套餐名称:', credit.package_name)
      console.log('  过期时间:', credit.package_expires_at)
      console.log('')
    }
    
    // 查询积分交易记录
    const transResult = await pool.query(
      `SELECT * FROM credit_transactions 
       WHERE related_order_id = $1 
       ORDER BY created_at DESC`,
      [order.id]
    )
    
    console.log('积分交易记录:')
    if (transResult.rows.length === 0) {
      console.log('  ❌ 没有找到相关的积分交易记录')
      console.log('  这说明积分充值步骤没有执行！')
    } else {
      transResult.rows.forEach(trans => {
        console.log(`  ${trans.transaction_type}: ${trans.credit_amount}积分 - ${trans.description}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message)
  }
  
  await pool.end()
}

checkOrder()
