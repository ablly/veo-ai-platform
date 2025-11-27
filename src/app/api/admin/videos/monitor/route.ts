/**
 * 视频状态监控API
 * 提供视频生成状态的实时监控数据
 */

import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    logger.info("开始查询视频监控数据")

    // 1. 统计各状态的视频数量（24小时内）
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM video_generations
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `)

    const stats = statsResult.rows[0]
    logger.info("统计数据查询完成", { context: { stats } })

    // 2. 查询卡住的视频数（超过5分钟）
    const stuckResult = await pool.query(`
      SELECT COUNT(*) as stuck
      FROM video_generations
      WHERE status = 'PROCESSING'
      AND created_at < NOW() - INTERVAL '5 minutes'
    `)

    const stuckCount = parseInt(stuckResult.rows[0].stuck) || 0
    logger.info("卡住视频查询完成", { context: { stuckCount } })

    // 3. 计算成功率
    const completedCount = parseInt(stats.completed) || 0
    const failedCount = parseInt(stats.failed) || 0
    const totalFinished = completedCount + failedCount
    const successRate = totalFinished > 0 
      ? ((completedCount / totalFinished) * 100).toFixed(1) + '%'
      : '0%'

    // 4. 计算平均处理时间
    const avgTimeResult = await pool.query(`
      SELECT ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60), 1) as avg_minutes
      FROM video_generations
      WHERE status = 'COMPLETED'
      AND completed_at IS NOT NULL
      AND created_at > NOW() - INTERVAL '24 hours'
    `)

    const avgMinutes = parseFloat(avgTimeResult.rows[0]?.avg_minutes) || 0
    const averageProcessingTime = avgMinutes > 0 ? `${avgMinutes}分钟` : '-'
    logger.info("平均时间计算完成", { context: { avgMinutes, averageProcessingTime } })

    // 5. 获取最近活动记录
    const recentActivityResult = await pool.query(`
      SELECT 
        id,
        status,
        created_at,
        completed_at
      FROM video_generations
      ORDER BY created_at DESC
      LIMIT 20
    `)

    const recentActivity = recentActivityResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      createdAt: row.created_at,
      completedAt: row.completed_at
    }))

    logger.info("最近活动查询完成", { context: { count: recentActivity.length } })

    const responseData = {
      totalVideos: parseInt(stats.total) || 0,
      processingVideos: parseInt(stats.processing) || 0,
      completedVideos: completedCount,
      failedVideos: failedCount,
      stuckVideos: stuckCount,
      successRate: successRate,
      averageProcessingTime: averageProcessingTime,
      recentActivity: recentActivity
    }

    logger.info("视频监控数据查询成功", { context: { responseData } })

    // 返回前端期望的格式
    return NextResponse.json(responseData)

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error("视频监控查询失败", { 
      context: { 
        error: errorMessage,
        stack: errorStack
      } 
    })
    
    // 返回一个安全的错误响应
    return NextResponse.json(
      {
        totalVideos: 0,
        processingVideos: 0,
        completedVideos: 0,
        failedVideos: 0,
        stuckVideos: 0,
        successRate: "0%",
        averageProcessingTime: "-",
        recentActivity: [],
        error: errorMessage
      },
      { status: 500 }
    )
  }
}
