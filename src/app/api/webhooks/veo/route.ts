import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"

/**
 * 速创API / VEO Webhook接收端点
 * 当视频生成完成时，API会调用此端点通知结果
 * 注意：速创API可能不支持webhook，如需使用请联系客服确认格式
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    logger.info("收到Webhook回调", { body })

    // 支持多种格式的响应
    // 格式1（速创API推测格式）:
    // {
    //   taskId: "...",
    //   status: "completed" | "failed",
    //   videoUrl: "...",
    //   errorMessage: "..."
    // }
    //
    // 格式2（VEO 3 API格式）:
    // {
    //   taskId: "...",
    //   successFlag: 0|1|2,
    //   response: { resultUrls: [...] },
    //   errorMessage: "..."
    // }

    // 兼容多种格式
    const taskId = body.taskId || body.task_id
    const status = body.status
    const successFlag = body.successFlag
    const videoUrl = body.videoUrl || body.video_url || body.response?.resultUrls?.[0]
    const errorMessage = body.errorMessage || body.error_message || body.error

    if (!taskId) {
      logger.error("Webhook缺少taskId", { body })
      return NextResponse.json({ error: "缺少taskId" }, { status: 400 })
    }

    // 查询数据库中的视频生成记录
    const videoResult = await pool.query(
      'SELECT id, user_id, credits_consumed FROM video_generations WHERE external_task_id = $1',
      [taskId]
    )

    if (videoResult.rows.length === 0) {
      logger.warn("Webhook收到未知taskId", { taskId })
      return NextResponse.json({ error: "任务不存在" }, { status: 404 })
    }

    const video = videoResult.rows[0]

    // 判断是否成功（兼容多种格式）
    const isSuccess = 
      status === 'completed' || 
      (successFlag === 1 && videoUrl)
    
    const isFailed = 
      status === 'failed' || 
      successFlag === 2

    if (isSuccess && videoUrl) {
      // 视频生成成功

      await pool.query(
        `UPDATE video_generations 
         SET status = 'COMPLETED',
             video_url = $1,
             completed_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [videoUrl, video.id]
      )

      logger.info("视频生成成功 (Webhook)", {
        videoId: video.id,
        taskId,
        videoUrl
      })

      return NextResponse.json({ success: true, message: "视频生成成功" })

    } else if (isFailed) {
      // 视频生成失败，回滚积分
      
      // 同时删除成本记录（如果生成失败则不应计入成本）
      await pool.query(
        'DELETE FROM api_cost_records WHERE video_id = $1',
        [video.id]
      )
      await pool.query(
        `UPDATE video_generations 
         SET status = 'FAILED',
             error_message = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [errorMessage || '视频生成失败', video.id]
      )

      // 退还积分
      await pool.query(
        `UPDATE user_credit_accounts 
         SET available_credits = available_credits + $1,
             used_credits = used_credits - $1,
             updated_at = NOW()
         WHERE user_id = $2`,
        [video.credits_consumed, video.user_id]
      )

      logger.info("视频生成失败，已退还积分 (Webhook)", {
        videoId: video.id,
        taskId,
        creditsRefunded: video.credits_consumed,
        error: errorMessage
      })

      return NextResponse.json({ success: true, message: "视频生成失败，已退还积分" })

    } else {
      // 仍在处理中
      logger.info("视频仍在处理中 (Webhook)", { videoId: video.id, taskId })
      return NextResponse.json({ success: true, message: "视频处理中" })
    }

  } catch (error) {
    logger.error("处理VEO Webhook失败", {
      error: error instanceof Error ? error.message : String(error)
    })
    return NextResponse.json(
      { error: "内部服务器错误" },
      { status: 500 }
    )
  }
}

// 允许GET请求用于健康检查
export async function GET() {
  return NextResponse.json({
    service: "速创API / VEO Webhook Endpoint",
    status: "active",
    timestamp: new Date().toISOString(),
    note: "速创API可能不支持webhook，主要通过轮询查询状态"
  })
}


