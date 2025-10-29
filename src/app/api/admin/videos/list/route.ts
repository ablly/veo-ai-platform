import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const offset = (page - 1) * limit

    // 构建搜索条件
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (search) {
      whereClause += ` AND (u.email ILIKE $${paramIndex} OR vg.prompt ILIKE $${paramIndex})`
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    if (status !== 'all') {
      whereClause += ` AND vg.status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // 查询视频列表
    const videosQuery = `
      SELECT 
        vg.id,
        vg.user_id,
        u.email as user_email,
        u.name as user_name,
        vg.prompt,
        vg.status,
        vg.video_url,
        vg.thumbnail_url,
        vg.credits_consumed,
        vg.api_provider,
        vg.model,
        vg.created_at,
        vg.completed_at,
        vg.error_message
      FROM video_generations vg
      LEFT JOIN users u ON vg.user_id = u.id
      ${whereClause}
      ORDER BY vg.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const videosResult = await pool.query(videosQuery, queryParams)

    // 查询总数和统计
    const countQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(COALESCE(vg.credits_consumed, 0)) as total_credits
      FROM video_generations vg
      LEFT JOIN users u ON vg.user_id = u.id
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalVideos = parseInt(countResult.rows[0].total)
    const totalCredits = parseInt(countResult.rows[0].total_credits || '0')
    const totalPages = Math.ceil(totalVideos / limit)

    logger.info("管理员查询视频列表", {
      page,
      limit,
      search,
      status,
      total_videos: totalVideos
    })

    return NextResponse.json({
      success: true,
      videos: videosResult.rows,
      totalVideos,
      totalCredits,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    logger.error("查询视频列表失败", { error })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "查询视频列表失败")
  }
}