import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    console.log("🔗 测试数据库连接...")
    const client = await pool.connect()
    console.log("✅ 连接成功")
    
    const result = await client.query('SELECT current_database(), current_user, COUNT(*) FROM users')
    console.log("✅ 查询成功:", result.rows[0])
    
    client.release()
    
    return NextResponse.json({
      success: true,
      message: "数据库连接正常",
      data: result.rows[0]
    })
  } catch (error) {
    console.error("❌ 数据库测试失败:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}













