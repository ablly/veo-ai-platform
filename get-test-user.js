require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function getTestUser() {
  try {
    const result = await pool.query(`
      SELECT id, email, name 
      FROM users 
      LIMIT 1
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ 找到测试用户:');
      console.log('  ID:', result.rows[0].id);
      console.log('  Email:', result.rows[0].email);
      console.log('  Name:', result.rows[0].name);
    } else {
      console.log('❌ 没有找到用户');
    }
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await pool.end();
  }
}

getTestUser();
