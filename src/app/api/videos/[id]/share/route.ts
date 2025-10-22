/**
 * 视频分享API
 * POST: 分享视频到Gallery
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

/**
 * POST /api/videos/[id]/share
 * 分享视频到Gallery
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      throw Errors.unauthorized()
    }

    const userId = session.user.id
    const { id } = await params

    logger.apiRequest("POST", `/api/videos/${id}/share`, { userId, videoId: id })

    // 检查视频是否存在且属于当前用户
    const videoResult = await client.query(
      `SELECT id, user_id, prompt, video_url, thumbnail_url, 
              duration, status
       FROM video_generations
       WHERE id = $1`,
      [id]
    )

    if (videoResult.rows.length === 0) {
      throw Errors.notFound("视频")
    }

    const video = videoResult.rows[0]

    if (video.user_id !== userId) {
      throw Errors.forbidden("您无权分享此视频")
    }

    if (video.status !== "COMPLETED") {
      throw Errors.badRequest("只能分享已完成的视频")
    }

    if (!video.video_url) {
      throw Errors.badRequest("视频URL不存在")
    }

    // 检查是否已经分享过
    const existingShare = await client.query(
      "SELECT id FROM gallery_videos WHERE prompt = $1 AND user_id = $2",
      [video.prompt, userId]
    )

    if (existingShare.rows.length > 0) {
      throw Errors.resourceExists("该视频已经分享过了")
    }

    // 插入到gallery_videos表
    await client.query(
      `INSERT INTO gallery_videos (
        title, description, video_url, thumbnail_url,
        duration, user_id, prompt, is_public, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW(), NOW())`,
      [
        video.prompt.substring(0, 100), // 使用prompt作为标题
        video.prompt,
        video.video_url,
        video.thumbnail_url,
        video.duration || 5,
        userId,
        video.prompt,
      ]
    )

    logger.userAction(userId, "Video shared to gallery", { videoId: id })
    logger.apiResponse("POST", `/api/videos/${id}/share`, 200)

    return NextResponse.json({
      success: true,
      message: "视频已成功分享到Gallery",
    })

  } catch (error) {
    logger.apiResponse("POST", "/api/videos/[id]/share", 500)
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}


