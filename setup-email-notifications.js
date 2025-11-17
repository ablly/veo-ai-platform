/**
 * 设置邮件通知系统
 * 创建必要的数据库表
 */

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function setupEmailNotifications() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 开始设置邮件通知系统...')
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, 'create-email-history-table.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    // 执行SQL
    await client.query(sql)
    
    console.log('✅ 邮件发送历史表创建成功！')
    console.log('\n📊 表结构：')
    console.log('- id: UUID (主键)')
    console.log('- recipient_id: 收件人用户ID')
    console.log('- recipient_email: 收件人邮箱')
    console.log('- subject: 邮件主题')
    console.log('- content: 邮件内容')
    console.log('- status: 发送状态 (SUCCESS/FAILED)')
    console.log('- error_message: 失败原因')
    console.log('- sent_at: 发送时间')
    
    console.log('\n✨ 邮件通知系统设置完成！')
    console.log('\n现在您可以：')
    console.log('1. 访问 /admin/notifications 发送邮件')
    console.log('2. 选择收件人（所有用户/选择用户/单个用户）')
    console.log('3. 编写邮件主题和内容')
    console.log('4. 点击发送')
    console.log('5. 在"发送历史"标签查看发送记录')
    
  } catch (error) {
    console.error('❌ 设置失败:', error.message)
    console.error('\n详细错误:', error)
  } finally {
    client.release()
    await pool.end()
  }
}

setupEmailNotifications()
