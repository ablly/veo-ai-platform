import { Pool } from "pg"

// Supabase数据库连接池配置
// 注意：Supabase有两种连接方式：
// 1. 直连（Direct Connection）：db.xxx.supabase.co:5432
// 2. 连接池（Pooler）：aws-0-xxx.pooler.supabase.com:6543
// 
// 使用直连方式连接Supabase数据库
// 格式：postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
const connectionString = process.env.DATABASE_URL ||  "postgresql://postgres:bxbbyffb4y4djTx3@db.hblthmkkdfkzvpywlthq.supabase.co:5432/postgres"

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // 连接池最大连接数
  min: 2,  // 最小连接数
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

// 监听连接事件
pool.on('connect', (client) => {
  console.log('✅ 数据库连接成功')
})

pool.on('error', (err, client) => {
  console.error('❌ 意外的数据库错误:', err)
})

pool.on('acquire', (client) => {
  // console.log('🔄 获取数据库连接')
})

pool.on('remove', (client) => {
  // console.log('🔄 释放数据库连接')
})

export default pool

