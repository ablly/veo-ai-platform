import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    let query = `
      SELECT 
        ga.id,
        ga.title,
        ga.description,
        ga.content,
        ga.views_count,
        ga.helpful_count,
        ga.created_at,
        ga.updated_at,
        gc.name as category_name,
        gc.icon as category_icon
      FROM guide_articles ga
      JOIN guide_categories gc ON ga.category_id = gc.id
      WHERE ga.is_published = true
    `
    
    const queryParams: any[] = []
    
    if (categoryId) {
      query += ` AND ga.category_id = $1`
      queryParams.push(categoryId)
    }
    
    query += ` ORDER BY ga.sort_order ASC, ga.created_at DESC`

    const result = await client.query(query, queryParams)

    return NextResponse.json({
      success: true,
      articles: result.rows
    })

  } catch (error) {
    console.error("获取指南文章失败:", error)
    return NextResponse.json(
      { error: "获取指南文章失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}



