import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  
  try {
    const { id: articleId } = await params

    // 增加浏览数
    await client.query(
      'UPDATE guide_articles SET views_count = views_count + 1 WHERE id = $1',
      [articleId]
    )

    // 获取最新浏览数
    const result = await client.query(
      'SELECT views_count FROM guide_articles WHERE id = $1',
      [articleId]
    )

    return NextResponse.json({
      success: true,
      viewsCount: result.rows[0]?.views_count || 0
    })

  } catch (error) {
    console.error("记录文章浏览失败:", error)
    return NextResponse.json(
      { error: "记录文章浏览失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
