import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT 
        gc.id,
        gc.name,
        gc.description,
        gc.icon,
        COUNT(ga.id) as article_count
      FROM guide_categories gc
      LEFT JOIN guide_articles ga ON gc.id = ga.category_id AND ga.is_published = true
      WHERE gc.is_active = true
      GROUP BY gc.id, gc.name, gc.description, gc.icon, gc.sort_order
      ORDER BY gc.sort_order ASC
    `)

    return NextResponse.json({
      success: true,
      categories: result.rows
    })

  } catch (error) {
    console.error("获取指南分类失败:", error)
    return NextResponse.json(
      { error: "获取指南分类失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}











