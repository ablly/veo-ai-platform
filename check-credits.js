require('dotenv').config()
const {Pool}=require('pg')
const pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}})
pool.query("SELECT available_credits FROM user_credit_accounts WHERE user_id=(SELECT id FROM users WHERE email='3533912007@qq.com')").then(r=>{console.log('✅ 当前积分:',r.rows[0]?.available_credits||0);pool.end()}).catch(e=>{console.error(e);pool.end()})
