/**
 * 我的视频列表API
 * GET: 获取用户的视频生成记录
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

/**
 * GET /api/videos/my-videos
 * 获取用户的视频列表（分页）
 */
export async function GET(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "12"), 50) // 最多50条
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    logger.info("GET", "/api/videos/my-videos", { userId, page, limit, status })

    // 构建查询条件
    let whereClause = "WHERE user_id = $1"
    const queryParams: any[] = [userId]
    
    if (status && status !== "ALL") {
      whereClause += ` AND status = $${queryParams.length + 1}`
      queryParams.push(status)
    }

    // 获取总数
    const countResult = await client.query(
      `SELECT COUNT(*) as total FROM video_generations ${whereClause}`,
      queryParams
    )

    const total = parseInt(countResult.rows[0].total)

    // 获取视频列表
    const videosResult = await client.query(
      `SELECT 
        id, prompt, video_url, thumbnail_url, status,
        duration, resolution, credits_consumed,
        created_at, completed_at, reference_images
       FROM video_generations
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
      [...queryParams, limit, offset]
    )

    const videos = videosResult.rows.map((row) => ({
      id: row.id,
      prompt: row.prompt,
      videoUrl: row.video_url,
      thumbnailUrl: row.thumbnail_url,
      status: row.status,
      duration: row.duration,
      resolution: row.resolution,
      creditsConsumed: row.credits_consumed,
      createdAt: row.created_at,
      completedAt: row.completed_at,
      referenceImages: row.reference_images,
    }))

    logger.info("GET", "/api/videos/my-videos", 200)

    return NextResponse.json({
      success: true,
      data: {
        videos,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    logger.info("GET", "/api/videos/my-videos", 500)
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}



