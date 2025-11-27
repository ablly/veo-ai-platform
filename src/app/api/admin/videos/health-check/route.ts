/**
 * 视频URL健康检查API
 * 检查所有已完成视频的URL是否可访问
 */

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"
import { checkVideoStatus } from "@/lib/video-models"

export async function POST(request: NextRequest) {
  // 管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    logger.info("开始视频健康检查")

    // 查询所有已完成但可能URL有问题的视频
    const result = await pool.query(`
      SELECT id, external_task_id, model, video_url, created_at
      FROM video_generations
      WHERE status = 'COMPLETED'
      AND video_url IS NOT NULL
      AND created_at > NOW() - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 100
    `)

    const videos = result.rows
    logger.info(`找到 ${videos.length} 个视频需要检查`)

    let healthy = 0
    let broken = 0
    let fixed = 0
    const brokenVideos = []

    for (const video of videos) {
      try {
        // 测试URL是否可访问
        const response = await fetch(video.video_url, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        })
        
        const contentType = response.headers.get('content-type')
        
        if (response.ok && contentType && contentType.includes('video')) {
          healthy++
        } else {
          broken++
          brokenVideos.push({
            id: video.id,
            taskId: video.external_task_id,
            model: video.model,
            url: video.video_url,
            status: response.status,
            contentType
          })
          
          // 尝试从API重新获取正确的URL
          logger.info(`尝试修复视频 ${video.id}`)
          const apiStatus = await checkVideoStatus(video.model, video.external_task_id)
          
          if (apiStatus.success && apiStatus.status === 'COMPLETED' && apiStatus.videoUrl) {
            // 更新为正确的URL
            await pool.query(`
              UPDATE video_generations
              SET video_url = $1,
                  updated_at = NOW()
              WHERE id = $2
            `, [apiStatus.videoUrl, video.id])
            
            fixed++
            logger.info(`✅ 视频 ${video.id} 已修复`)
          }
        }
      } catch (error) {
        broken++
        brokenVideos.push({
          id: video.id,
          taskId: video.external_task_id,
          model: video.model,
          url: video.video_url,
          error: error instanceof Error ? error.message : String(error)
        })
      }
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    logger.info("视频健康检查完成", { 
      context: { healthy, broken, fixed, total: videos.length } 
    })

    return NextResponse.json({
      success: true,
      message: '健康检查完成',
      total: videos.length,
      healthy,
      broken,
      fixed,
      brokenVideos
    })

  } catch (error) {
    logger.error("视频健康检查失败", { 
      context: { error: error instanceof Error ? error.message : String(error) } 
    })
    return createErrorResponse(Errors.databaseError("健康检查失败"))
  }
}
