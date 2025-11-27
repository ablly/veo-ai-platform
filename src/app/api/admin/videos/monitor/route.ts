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
    // 统计各状态的视频数量
    const statusStats = await pool.query(`
      SELECT 
        status,
        model,
        COUNT(*) as count
      FROM video_generations
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY status, model
      ORDER BY status, model
    `)

    // 查找长时间处于PROCESSING状态的视频
    const stuckVideos = await pool.query(`
      SELECT 
        vg.id,
        vg.external_task_id,
        vg.model,
        vg.prompt,
        vg.created_at,
        u.email as user_email,
        EXTRACT(EPOCH FROM (NOW() - vg.created_at))/60 as minutes_stuck
      FROM video_generations vg
      JOIN users u ON vg.user_id = u.id
      WHERE vg.status = 'PROCESSING'
      AND vg.created_at < NOW() - INTERVAL '30 minutes'
      ORDER BY vg.created_at ASC
      LIMIT 20
    `)

    // 最近失败的视频
    const recentFailures = await pool.query(`
      SELECT 
        vg.id,
        vg.external_task_id,
        vg.model,
        vg.error_message,
        vg.created_at,
        u.email as user_email
      FROM video_generations vg
      JOIN users u ON vg.user_id = u.id
      WHERE vg.status = 'FAILED'
      AND vg.created_at > NOW() - INTERVAL '24 hours'
      ORDER BY vg.created_at DESC
      LIMIT 10
    `)

    // 计算成功率
    const successRate = await pool.query(`
      SELECT 
        model,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed,
        COUNT(*) as total,
        ROUND(
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END)::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as success_rate
      FROM video_generations
      WHERE created_at > NOW() - INTERVAL '24 hours'
      AND status IN ('COMPLETED', 'FAILED')
      GROUP BY model
    `)

    // 平均生成时间
    const avgGenerationTime = await pool.query(`
      SELECT 
        model,
        ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/60), 2) as avg_minutes
      FROM video_generations
      WHERE status = 'COMPLETED'
      AND completed_at IS NOT NULL
      AND created_at > NOW() - INTERVAL '24 hours'
      GROUP BY model
    `)

    return NextResponse.json({
      success: true,
      data: {
        statusStats: statusStats.rows,
        stuckVideos: stuckVideos.rows,
        recentFailures: recentFailures.rows,
        successRate: successRate.rows,
        avgGenerationTime: avgGenerationTime.rows
      }
    })

  } catch (error) {
    logger.error("视频监控查询失败", { 
      context: { error: error instanceof Error ? error.message : String(error) } 
    })
    return createErrorResponse(Errors.databaseError("监控查询失败"))
  }
}
