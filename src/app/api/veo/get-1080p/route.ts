import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"

// VEO API配置
const VEO_API_URL = process.env.VEO_API_URL || "https://api.veo3api.ai/api/v1"
const VEO_API_KEY = process.env.VEO_API_KEY

/**
 * 获取1080P高清版本视频
 * 仅适用于16:9宽高比的视频
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return createErrorResponse(Errors.UNAUTHORIZED, "用户未登录")
    }

    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const index = parseInt(searchParams.get('index') || '0', 10)

    if (!taskId) {
      return createErrorResponse(Errors.VALIDATION_ERROR, "缺少taskId参数")
    }

    if (!VEO_API_KEY) {
      return createErrorResponse(Errors.CONFIGURATION_ERROR, "VEO API密钥未配置")
    }

    // 验证用户是否拥有此视频
    const videoResult = await pool.query(
      `SELECT vg.* 
       FROM video_generations vg
       JOIN users u ON vg.user_id = u.id
       WHERE vg.external_task_id = $1 AND u.email = $2`,
      [taskId, session.user.email]
    )

    if (videoResult.rows.length === 0) {
      return createErrorResponse(Errors.NOT_FOUND, "视频不存在或无权访问")
    }

    const video = videoResult.rows[0]

    // 检查视频是否已完成
    if (video.status !== 'COMPLETED') {
      return createErrorResponse(Errors.VALIDATION_ERROR, "视频尚未生成完成")
    }

    logger.info("请求1080P视频", { taskId, index, userEmail: session.user.email })

    // 调用VEO 3 API获取1080P视频
    const response = await fetch(
      `${VEO_API_URL}/veo/get-1080p-video?taskId=${taskId}&index=${index}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VEO_API_KEY}`
        },
        signal: AbortSignal.timeout(30000) // 30秒超时
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      logger.error("VEO API获取1080P视频失败", {
        status: response.status,
        error: errorData
      })
      return createErrorResponse(
        Errors.EXTERNAL_API_ERROR,
        errorData.msg || `获取1080P视频失败: ${response.status}`
      )
    }

    const result = await response.json()

    // VEO 3 API 响应格式: { code: 200, data: { resultUrl: "..." }, msg: "success" }
    if (result.code !== 200 || !result.data || !result.data.resultUrl) {
      logger.error("VEO API返回格式错误", { result })
      return createErrorResponse(
        Errors.EXTERNAL_API_ERROR,
        result.msg || "获取1080P视频失败"
      )
    }

    const hdVideoUrl = result.data.resultUrl

    // 可选：更新数据库记录保存1080P版本URL
    await pool.query(
      `UPDATE video_generations 
       SET hd_video_url = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [hdVideoUrl, video.id]
    )

    logger.info("1080P视频获取成功", {
      taskId,
      hdVideoUrl,
      videoId: video.id
    })

    return NextResponse.json({
      success: true,
      hdVideoUrl,
      message: "1080P高清视频获取成功"
    })

  } catch (error) {
    logger.error("获取1080P视频失败", {
      error: error instanceof Error ? error.message : String(error)
    })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "服务器内部错误")
  }
}









