/**
 * 单个视频操作API
 * DELETE: 删除视频
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import pool from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

/**
 * DELETE /api/videos/[id]
 * 删除视频（软删除）
 */
export async function DELETE(
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

    logger.apiRequest("DELETE", `/api/videos/${id}`, { userId, videoId: id })

    // 检查视频是否存在且属于当前用户
    const videoCheck = await client.query(
      "SELECT id, user_id FROM video_generations WHERE id = $1",
      [id]
    )

    if (videoCheck.rows.length === 0) {
      throw Errors.notFound("视频")
    }

    if (videoCheck.rows[0].user_id !== userId) {
      throw Errors.forbidden("您无权删除此视频")
    }

    // 软删除：更新status为DELETED（如果需要真删除，可以直接DELETE）
    await client.query(
      "UPDATE video_generations SET status = 'FAILED', updated_at = NOW() WHERE id = $1",
      [id]
    )

    logger.userAction(userId, "Video deleted", { videoId: id })
    logger.apiResponse("DELETE", `/api/videos/${id}`, 200)

    return NextResponse.json({
      success: true,
      message: "视频已删除",
    })

  } catch (error) {
    logger.apiResponse("DELETE", "/api/videos/[id]", 500)
    return createErrorResponse(error)
  } finally {
    client.release()
  }
}


