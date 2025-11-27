/**
 * 自动修复卡住的视频
 * 每小时运行一次，检查并修复长时间处于PROCESSING状态的视频
 */

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"
import { checkVideoStatus } from "@/lib/video-models"

export async function GET(request: NextRequest) {
  try {
    // 验证Cron密钥
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info("开始自动修复卡住的视频")

    // 查找超过30分钟仍在PROCESSING状态的视频
    const result = await pool.query(`
      SELECT id, external_task_id, model, prompt, created_at
      FROM video_generations
      WHERE status = 'PROCESSING'
      AND external_task_id IS NOT NULL
      AND created_at < NOW() - INTERVAL '30 minutes'
      AND created_at > NOW() - INTERVAL '48 hours'
      ORDER BY created_at ASC
      LIMIT 50
    `)

    const videos = result.rows
    logger.info(`找到 ${videos.length} 个可能卡住的视频`)

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有卡住的视频',
        fixed: 0
      })
    }

    let fixed = 0
    let failed = 0
    let stillProcessing = 0

    for (const video of videos) {
      const model = video.model || 'veo3'
      const status = await checkVideoStatus(model, video.external_task_id)

      if (!status.success) {
        logger.error('查询视频状态失败', { 
          context: { videoId: video.id, taskId: video.external_task_id } 
        })
        continue
      }

      if (status.status === 'COMPLETED' && status.videoUrl) {
        // 更新为完成状态
        await pool.query(`
          UPDATE video_generations
          SET status = 'COMPLETED',
              video_url = $1,
              remix_pid = $2,
              completed_at = NOW(),
              updated_at = NOW()
          WHERE id = $3
        `, [status.videoUrl, status.remixPid || null, video.id])

        logger.info("✅ 修复卡住的视频", { 
          context: { 
            videoId: video.id, 
            taskId: video.external_task_id,
            model: model,
            stuckMinutes: Math.round((Date.now() - new Date(video.created_at).getTime()) / 60000)
          } 
        })
        fixed++
      } else if (status.status === 'FAILED') {
        // 更新为失败状态
        await pool.query(`
          UPDATE video_generations
          SET status = 'FAILED',
              error_message = $1,
              updated_at = NOW()
          WHERE id = $2
        `, [status.error || '生成失败', video.id])

        logger.info("视频生成失败", { 
          context: { 
            videoId: video.id, 
            taskId: video.external_task_id,
            error: status.error
          } 
        })
        failed++
      } else {
        stillProcessing++
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    logger.info("自动修复完成", { context: { fixed, failed, stillProcessing } })

    return NextResponse.json({
      success: true,
      message: '自动修复完成',
      fixed,
      failed,
      stillProcessing,
      total: videos.length
    })

  } catch (error) {
    logger.error("自动修复失败", { 
      context: { error: error instanceof Error ? error.message : String(error) } 
    })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '自动修复失败'
    }, { status: 500 })
  }
}
