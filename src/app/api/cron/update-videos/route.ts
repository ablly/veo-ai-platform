/**
 * 定时任务：更新视频生成状态
 * 用于自动检查并更新所有PROCESSING状态的视频
 */

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"
import { API_CONFIG } from "@/config/api"

const SUCHUANG_API_URL = API_CONFIG.SUCHUANG.BASE_URL
const SUCHUANG_API_KEY = API_CONFIG.SUCHUANG.API_KEY

// 检查速创API状态
async function checkSuchuangStatus(taskId: string) {
  try {
    const response = await fetch(
      `${SUCHUANG_API_URL}/api/video/veoDetail?key=${SUCHUANG_API_KEY}&id=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset:utf-8;',
          'Authorization': SUCHUANG_API_KEY
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    if (result.code !== 200 || !result.data) {
      throw new Error(result.msg || '查询失败')
    }

    const data = result.data
    
    // 记录原始响应用于调试
    logger.info("速创API原始响应", { 
      taskId, 
      status: data.status, 
      hasContent: !!data.content,
      contentPreview: data.content ? data.content.substring(0, 80) : null
    })
    
    // 根据status数字判断状态（0:排队中，1:成功，2:失败，3:生成中）
    if (data.status === 1 && data.content) {
      logger.info("✅ 视频URL获取成功", { 
        taskId, 
        videoUrl: data.content 
      })
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.content,
        error: null
      }
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        videoUrl: null,
        error: data.fail_reason || '视频生成失败'
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING',
        videoUrl: null,
        error: null
      }
    }
  } catch (error) {
    logger.error("查询速创API状态失败", { taskId, error })
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败"
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证请求来源（可选：添加密钥验证）
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    logger.info("开始更新视频状态")

    // 查询所有PROCESSING状态且有external_task_id的视频
    const result = await pool.query(`
      SELECT id, external_task_id, prompt, created_at
      FROM video_generations
      WHERE status = 'PROCESSING' 
      AND external_task_id IS NOT NULL
      AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 50
    `)

    const videos = result.rows
    logger.info(`找到 ${videos.length} 个待检查的视频`)

    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        message: '没有需要更新的视频',
        updated: 0
      })
    }

    let updated = 0
    let failed = 0
    let processing = 0

    for (const video of videos) {
      const status = await checkSuchuangStatus(video.external_task_id)

      if (!status.success) {
        continue
      }

      if (status.status === 'COMPLETED' && status.videoUrl) {
        // 更新为完成状态
        await pool.query(`
          UPDATE video_generations
          SET status = 'COMPLETED',
              video_url = $1,
              completed_at = NOW(),
              updated_at = NOW()
          WHERE id = $2
        `, [status.videoUrl, video.id])

        logger.info("✅ 视频生成完成并更新URL", { 
          videoId: video.id, 
          taskId: video.external_task_id,
          videoUrl: status.videoUrl,
          prompt: video.prompt.substring(0, 50)
        })
        updated++
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
          videoId: video.id, 
          taskId: video.external_task_id,
          error: status.error
        })
        failed++
      } else {
        processing++
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    logger.info("视频状态更新完成", { updated, failed, processing })

    // 收集更新详情
    const videoDetails = []
    for (const video of videos) {
      const status = await checkSuchuangStatus(video.external_task_id)
      videoDetails.push({
        id: video.id,
        prompt: video.prompt.substring(0, 50),
        taskId: video.external_task_id,
        status: status.status || 'PROCESSING',
        videoUrl: status.videoUrl,
        error: status.error
      })
    }

    return NextResponse.json({
      success: true,
      message: '更新完成',
      updated,
      failed,
      processing,
      total: videos.length,
      videos: videoDetails
    })

  } catch (error) {
    logger.error("更新视频状态失败", { error })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败'
    }, { status: 500 })
  }
}
