/**
 * 更新管理员密码脚本
 * 
 * 使用方法：
 * node update-admin-password.js
 * 
 * 这个脚本会更新管理员账号的密码为: 050102
 */

const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function updateAdminPassword() {
  const client = await pool.connect()
  
  try {
    console.log('🔄 开始更新管理员密码...')
    
    // 密码 "050102" 的 bcrypt 哈希值
    const passwordHash = '$2b$10$D1vByvkC2gPdbHct0t9Up.NFzA6lVY8rvR71Ze5tCo8495bLsIoUC'
    
    // 更新密码
    const result = await client.query(
      `UPDATE users 
       SET password = $1, updated_at = NOW() 
       WHERE email = '3533912007@qq.com'
       RETURNING id, email, name`,
      [passwordHash]
    )
    
    if (result.rows.length > 0) {
      const user = result.rows[0]
      console.log('✅ 密码更新成功！')
      console.log('📧 邮箱:', user.email)
      console.log('👤 姓名:', user.name)
      console.log('🔑 新密码: 050102')
      console.log('\n现在您可以使用以下方式登录管理后台：')
      console.log('1. 邮箱 + 密码登录')
      console.log('   - 邮箱: 3533912007@qq.com')
      console.log('   - 密码: 050102')
      console.log('2. 邮箱验证码登录（原有方式）')
    } else {
      console.log('❌ 未找到管理员账号')
    }
  } catch (error) {
    console.error('❌ 更新失败:', error.message)
  } finally {
    client.release()
    await pool.end()
  }
}

updateAdminPassword()
