/**
 * 定时任务：更新视频生成状态
 * 用于自动检查并更新所有PROCESSING状态的视频
 * 支持 VEO3 和 SORA2 两种模型
 */

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { logger } from "@/lib/logger"
import { API_CONFIG } from "@/config/api"

const SUCHUANG_API_URL = API_CONFIG.SUCHUANG.BASE_URL
const SUCHUANG_API_KEY = API_CONFIG.SUCHUANG.API_KEY

// 检查VEO视频状态
async function checkVeoStatus(taskId: string) {
  try {
    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.VEO_QUERY}?key=${SUCHUANG_API_KEY}&id=${taskId}`,
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
    
    logger.info("VEO API原始响应", { 
      context: { taskId, status: data.status, hasContent: !!data.content }
    })
    
    // VEO状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.content) {
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.content,
        remixPid: null,
        error: null
      }
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        videoUrl: null,
        remixPid: null,
        error: data.fail_reason || '视频生成失败'
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING',
        videoUrl: null,
        remixPid: null,
        error: null
      }
    }
  } catch (error) {
    logger.error("查询VEO API状态失败", { context: { taskId, error: error instanceof Error ? error.message : String(error) } })
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败"
    }
  }
}

// 检查SORA2视频状态
async function checkSora2Status(taskId: string) {
  try {
    const response = await fetch(
      `${SUCHUANG_API_URL}${API_CONFIG.SUCHUANG.ENDPOINTS.SORA2_DETAIL}?key=${SUCHUANG_API_KEY}&id=${taskId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset:utf-8;',
          'Authorization': SUCHUANG_API_KEY
        },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()
    
    logger.info("SORA2 API原始响应", { 
      context: { taskId, code: result.code, data: result.data }
    })
    
    // 兼容 code: 200 和 code: 0
    if ((result.code !== 200 && result.code !== 0) || !result.data) {
      throw new Error(result.msg || result.message || '查询失败')
    }

    const data = result.data
    
    // SORA2状态码：0=排队中，1=成功，2=失败，3=生成中
    if (data.status === 1 && data.remote_url) {
      logger.info("✅ SORA2视频生成成功", { 
        context: { taskId, videoUrl: data.remote_url, pid: data.pid }
      })
      return {
        success: true,
        status: 'COMPLETED',
        videoUrl: data.remote_url,
        remixPid: data.pid || null,
        error: null
      }
    } else if (data.status === 2) {
      return {
        success: true,
        status: 'FAILED',
        videoUrl: null,
        remixPid: null,
        error: data.fail_reason || '视频生成失败'
      }
    } else {
      return {
        success: true,
        status: 'PROCESSING',
        videoUrl: null,
        remixPid: null,
        error: null
      }
    }
  } catch (error) {
    logger.error("查询SORA2 API状态失败", { context: { taskId, error: error instanceof Error ? error.message : String(error) } })
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败"
    }
  }
}

// 根据模型类型检查视频状态
async function checkVideoStatus(taskId: string, model: string) {
  if (model === 'sora2') {
    return checkSora2Status(taskId)
  } else {
    return checkVeoStatus(taskId)
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

    // 查询所有PROCESSING状态且有external_task_id的视频（包含model字段）
    const result = await pool.query(`
      SELECT id, external_task_id, prompt, model, created_at
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
    const videoDetails = []

    for (const video of videos) {
      // 根据模型类型使用正确的API端点
      const model = video.model || 'veo3'
      const status = await checkVideoStatus(video.external_task_id, model)

      if (!status.success) {
        videoDetails.push({
          id: video.id,
          prompt: video.prompt.substring(0, 50),
          taskId: video.external_task_id,
          model: model,
          status: 'ERROR',
          error: status.error
        })
        continue
      }

      if (status.status === 'COMPLETED' && status.videoUrl) {
        // 更新为完成状态（包括remix_pid用于续作功能）
        await pool.query(`
          UPDATE video_generations
          SET status = 'COMPLETED',
              video_url = $1,
              remix_pid = $2,
              completed_at = NOW(),
              updated_at = NOW()
          WHERE id = $3
        `, [status.videoUrl, status.remixPid || null, video.id])

        logger.info("✅ 视频生成完成并更新URL", { 
          context: { 
            videoId: video.id, 
            taskId: video.external_task_id,
            model: model,
            videoUrl: status.videoUrl,
            prompt: video.prompt.substring(0, 50)
          }
        })
        updated++
        
        videoDetails.push({
          id: video.id,
          prompt: video.prompt.substring(0, 50),
          taskId: video.external_task_id,
          model: model,
          status: 'COMPLETED',
          videoUrl: status.videoUrl
        })
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
            model: model,
            error: status.error
          }
        })
        failed++
        
        videoDetails.push({
          id: video.id,
          prompt: video.prompt.substring(0, 50),
          taskId: video.external_task_id,
          model: model,
          status: 'FAILED',
          error: status.error
        })
      } else {
        processing++
        videoDetails.push({
          id: video.id,
          prompt: video.prompt.substring(0, 50),
          taskId: video.external_task_id,
          model: model,
          status: 'PROCESSING'
        })
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    logger.info("视频状态更新完成", { context: { updated, failed, processing } })

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
    logger.error("更新视频状态失败", { context: { error: error instanceof Error ? error.message : String(error) } })
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败'
    }, { status: 500 })
  }
}
