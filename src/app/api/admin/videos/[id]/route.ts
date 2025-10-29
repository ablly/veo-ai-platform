import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const resolvedParams = await params
    const videoId = resolvedParams.id

    // 检查视频是否存在
    const checkResult = await pool.query(
      "SELECT id, video_url, thumbnail_url FROM video_generations WHERE id = $1",
      [videoId]
    )

    if (checkResult.rows.length === 0) {
      return createErrorResponse(Errors.NOT_FOUND, "视频不存在")
    }

    // 删除视频记录
    await pool.query(
      "DELETE FROM video_generations WHERE id = $1",
      [videoId]
    )

    logger.info("管理员删除视频", {
      video_id: videoId
    })

    return NextResponse.json({
      success: true,
      message: "视频删除成功"
    })

  } catch (error) {
    logger.error("删除视频失败", { error, video_id: videoId })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "删除视频失败")
  }
}
