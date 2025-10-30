import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  const client = await pool.connect()
  
  try {
    const result = await client.query(`
      SELECT 
        vc.id,
        vc.name,
        vc.description,
        COUNT(gv.id) as video_count
      FROM video_categories vc
      LEFT JOIN gallery_videos gv ON vc.id = gv.category_id AND gv.is_public = true
      WHERE vc.is_active = true
      GROUP BY vc.id, vc.name, vc.description, vc.sort_order
      ORDER BY vc.sort_order ASC
    `)

    return NextResponse.json({
      success: true,
      categories: [
        { id: 'all', name: '全部', description: '所有分类', video_count: 0 },
        ...result.rows
      ]
    })

  } catch (error) {
    console.error("获取分类数据失败:", error)
    return NextResponse.json(
      { error: "获取分类数据失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}













