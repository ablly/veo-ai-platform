import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = parseInt(searchParams.get('offset') || '0')

    let whereConditions = ['is_public = true']
    let queryParams: any[] = []
    let paramIndex = 1

    // 搜索筛选
    if (search) {
      whereConditions.push(`(
        title ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        prompt ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // 查询视频列表 - 简化查询，直接从gallery_videos表获取
    const videosQuery = `
      SELECT 
        id,
        title,
        description,
        video_url,
        thumbnail_url,
        duration,
        COALESCE(views_count, 0) as views_count,
        COALESCE(likes_count, 0) as likes_count,
        COALESCE(downloads_count, 0) as downloads_count,
        is_featured,
        prompt,
        created_at
      FROM gallery_videos
      ${whereClause}
      ORDER BY is_featured DESC, created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)

    const videosResult = await client.query(videosQuery, queryParams)

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM gallery_videos
      ${whereClause}
    `

    const countResult = await client.query(countQuery, queryParams.slice(0, -2))

    return NextResponse.json({
      success: true,
      videos: videosResult.rows,
      total: parseInt(countResult.rows[0].total),
      hasMore: offset + limit < parseInt(countResult.rows[0].total)
    })

  } catch (error) {
    console.error("获取作品展示数据失败:", error)
    return NextResponse.json(
      { error: "获取作品展示数据失败", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}



