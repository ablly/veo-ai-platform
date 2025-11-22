/**
 * 检查订单状态并手动发送邮件
 * 用于诊断邮件发送问题
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

async function checkOrderAndSendEmail() {
  console.log('🔍 开始检查订单状态...\n')
  
  // 订单号（最新的订单）
  const orderNumber = 'VEO17637926205477O9JQ4'
  
  try {
    // 查询订单
    const orderResult = await pool.query(
      `SELECT 
        co.*,
        u.email as user_email,
        u.name as user_name,
        cp.name as package_name,
        cp.credits as package_credits,
        uca.available_credits as user_current_credits
      FROM credit_orders co
      LEFT JOIN users u ON co.user_id = u.id
      LEFT JOIN credit_packages cp ON co.package_id = cp.id
      LEFT JOIN user_credit_accounts uca ON co.user_id = uca.user_id
      WHERE co.order_number = $1`,
      [orderNumber]
    )
    
    if (orderResult.rows.length === 0) {
      console.error('❌ 订单不存在:', orderNumber)
      process.exit(1)
    }
    
    const order = orderResult.rows[0]
    
    console.log('📋 订单信息:')
    console.log('   订单号:', order.order_number)
    console.log('   用户邮箱:', order.user_email)
    console.log('   用户名:', order.user_name || '未设置')
    console.log('   套餐:', order.package_name)
    console.log('   积分:', order.package_credits)
    console.log('   金额:', order.payment_amount)
    console.log('   订单状态:', order.status)
    console.log('   支付时间:', order.payment_time || '未支付')
    console.log('   用户当前积分:', order.user_current_credits || 0)
    console.log('')
    
    // 检查订单状态
    if (order.status === 'PENDING') {
      console.log('⚠️  订单状态为 PENDING（待支付）')
      console.log('   这意味着支付宝回调还没有被处理')
      console.log('')
      console.log('可能的原因:')
      console.log('1. 支付宝还没有发送回调（通常1-2分钟）')
      console.log('2. 回调URL配置错误（/callback vs /notify）')
      console.log('3. 回调处理失败（签名验证、数据库错误等）')
      console.log('')
      console.log('建议操作:')
      console.log('1. 等待2-3分钟后再检查')
      console.log('2. 查看Vercel日志，搜索订单号')
      console.log('3. 使用管理后台的"手动完成"功能')
      console.log('')
    } else if (order.status === 'PAID' || order.status === 'COMPLETED') {
      console.log('✅ 订单状态为', order.status, '（已支付/已完成）')
      console.log('   支付宝回调已被处理')
      console.log('   积分应该已经到账')
      console.log('')
      
      // 检查邮件发送
      console.log('📧 检查邮件配置...')
      console.log('   ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ 未配置')
      console.log('   SMTP_USER:', process.env.SMTP_USER || '❌ 未配置')
      console.log('   SMTP_HOST:', process.env.SMTP_HOST || '❌ 未配置')
      console.log('')
      
      if (!process.env.ADMIN_EMAIL || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.error('❌ 邮件配置不完整，无法发送邮件')
        console.log('请检查环境变量配置')
        process.exit(1)
      }
      
      // 尝试手动发送邮件
      console.log('📧 尝试手动发送邮件...\n')
      
      const { EmailService } = await import('./src/lib/email.js')
      
      // 计算过期时间
      let validityDays = 30
      if (order.package_name.includes('新手')) validityDays = 7
      if (order.package_name.includes('专业')) validityDays = 90
      if (order.package_name.includes('企业')) validityDays = 180
      
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + validityDays)
      
      // 发送用户邮件
      console.log('📧 发送用户购买成功邮件...')
      const userEmailResult = await EmailService.sendPurchaseSuccess({
        email: order.user_email,
        userName: order.user_name || order.user_email.split('@')[0],
        packageName: order.package_name,
        credits: order.package_credits,
        expiresAt: expiresAt.toLocaleDateString('zh-CN'),
        amount: parseFloat(order.payment_amount)
      })
      
      if (userEmailResult.success) {
        console.log('   ✅ 用户邮件发送成功')
        console.log('   📨 Message ID:', userEmailResult.messageId)
      } else {
        console.log('   ❌ 用户邮件发送失败:', userEmailResult.error)
      }
      console.log('')
      
      // 发送管理员邮件
      console.log('📧 发送管理员订单通知邮件...')
      const adminEmailResult = await EmailService.sendAdminOrderNotification({
        orderNumber: order.order_number,
        userName: order.user_name || order.user_email.split('@')[0],
        userEmail: order.user_email,
        packageName: order.package_name,
        credits: order.package_credits,
        amount: parseFloat(order.payment_amount),
        buyerId: order.alipay_trade_no || 'N/A',
        alipayTradeNo: order.alipay_trade_no || 'N/A',
        paidAt: order.payment_time ? new Date(order.payment_time).toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) : new Date().toLocaleString('zh-CN', {
          timeZone: 'Asia/Shanghai',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      })
      
      if (adminEmailResult.success) {
        console.log('   ✅ 管理员邮件发送成功')
        console.log('   📨 Message ID:', adminEmailResult.messageId)
      } else {
        console.log('   ❌ 管理员邮件发送失败:', adminEmailResult.error)
      }
      console.log('')
      
      console.log('🎉 邮件发送完成！')
      console.log('请检查邮箱（包括垃圾邮件文件夹）')
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
    console.error(error)
  } finally {
    await pool.end()
  }
}

checkOrderAndSendEmail()
