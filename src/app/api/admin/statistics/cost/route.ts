import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 成本统计API
 * 用于管理后台查看API成本和收益情况
 */
export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  // 在try外部定义变量，以便在catch中访问
  let period = 'today'
  
  try {

    const { searchParams } = new URL(request.url)
    period = searchParams.get('period') || 'today' // today | week | month | all

    // 根据时间段构建SQL过滤条件
    let dateFilter = ''
    switch(period) {
      case 'today':
        dateFilter = "DATE(created_at) = CURRENT_DATE"
        break
      case 'week':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '7 days'"
        break
      case 'month':
        dateFilter = "created_at >= CURRENT_DATE - INTERVAL '30 days'"
        break
      default:
        dateFilter = "1=1" // 全部
    }

    // 查询API成本明细
    const costResult = await pool.query(`
      SELECT 
        COUNT(*) as total_videos,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        api_provider,
        model
      FROM api_cost_records
      WHERE ${dateFilter}
      GROUP BY api_provider, model
      ORDER BY total_cost DESC
    `)

    // 查询收入（已完成的订单）
    const revenueResult = await pool.query(`
      SELECT 
        SUM(payment_amount) as total_revenue,
        COUNT(*) as total_orders
      FROM credit_orders
      WHERE status = 'COMPLETED'
        AND ${dateFilter}
    `)

    // 查询积分使用情况
    const creditsResult = await pool.query(`
      SELECT 
        SUM(credits_consumed) as total_credits_used,
        COUNT(*) as total_videos_generated
      FROM video_generations
      WHERE ${dateFilter}
        AND status IN ('COMPLETED', 'PROCESSING')
    `)

    // 查询用户统计
    const userStatsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT user_id) as active_users
      FROM video_generations
      WHERE ${dateFilter}
    `)

    // 处理数据（处理NULL值）
    const costs = costResult.rows || []
    const revenue = revenueResult.rows[0] || {}
    const credits = creditsResult.rows[0] || {}
    const userStats = userStatsResult.rows[0] || {}

    const totalCost = costs.reduce((sum, row) => sum + parseFloat(row.total_cost || '0'), 0)
    const totalRevenue = parseFloat(revenue.total_revenue || '0')
    const profit = totalRevenue - totalCost
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100).toFixed(2) : '0'

    logger.info("查询成本统计", { period, totalCost, totalRevenue, profit })

    return NextResponse.json({
      success: true,
      period,
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalCost: totalCost.toFixed(2),
        profit: profit.toFixed(2),
        profitMargin: `${profitMargin}%`,
        totalOrders: parseInt(revenue.total_orders || '0'),
        totalVideos: parseInt(credits.total_videos_generated || '0'),
        totalCreditsUsed: parseInt(credits.total_credits_used || '0'),
        activeUsers: parseInt(userStats.active_users || '0')
      },
      costBreakdown: costs.map(row => ({
        provider: row.api_provider,
        model: row.model,
        count: parseInt(row.total_videos),
        totalCost: parseFloat(row.total_cost),
        avgCost: parseFloat(row.avg_cost)
      }))
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorObj = error instanceof Error ? error : new Error(errorMessage)
    
    logger.error('成本统计查询失败', { 
      error: errorObj,
      context: { 
        period,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    })
    
    console.error('详细错误信息:', error)
    
    return createErrorResponse(
      Errors.INTERNAL_SERVER_ERROR, 
      `统计查询失败: ${errorMessage}`
    )
  }
}

