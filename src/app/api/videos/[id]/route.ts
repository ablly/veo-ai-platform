import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.unauthorized("用户未登录"))
    }

    const { id: videoId } = await params

    // 查询视频信息
    const result = await pool.query(
      `SELECT vg.id, vg.prompt, vg.model, vg.remix_pid, vg.video_url, vg.status, vg.created_at
       FROM video_generations vg
       JOIN users u ON vg.user_id = u.id
       WHERE vg.id = $1 AND u.email = $2`,
      [videoId, session.user.email]
    )

    if (result.rows.length === 0) {
      return createErrorResponse(Errors.notFound("视频"))
    }

    const video = result.rows[0]

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        prompt: video.prompt,
        model: video.model,
        remixPid: video.remix_pid,
        videoUrl: video.video_url,
        status: video.status,
        createdAt: video.created_at
      }
    })

  } catch (error) {
    console.error("获取视频信息失败:", error)
    return createErrorResponse(error instanceof Error ? error : new Error(String(error)))
  }
}
