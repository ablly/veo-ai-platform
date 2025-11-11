import { Pool } from "pg"

// Supabase数据库连接池配置
// 注意：Supabase有两种连接方式：
// 1. 直连（Direct Connection）：db.xxx.supabase.co:5432
// 2. 连接池（Pooler）：aws-xxx.pooler.supabase.com:6543
// 
// 优先使用环境变量中的连接字符串
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('❌ DATABASE_URL 环境变量未设置！请检查 .env 文件')
}

console.log('🔗 使用数据库连接:', connectionString.replace(/:([^:@]+)@/, ':****@'))

export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // 连接池最大连接数（增加）
  min: 1,  // 最小连接数（减少）
  idleTimeoutMillis: 60000, // 空闲超时（增加到60秒）
  connectionTimeoutMillis: 20000, // 连接超时（增加到20秒）
  acquireTimeoutMillis: 20000, // 获取连接超时
  createTimeoutMillis: 20000, // 创建连接超时
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

