import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || 'week'

    // 计算时间范围
    let dateFilter = ''
    switch (range) {
      case 'today':
        dateFilter = "AND sent_at >= CURRENT_DATE"
        break
      case 'week':
        dateFilter = "AND sent_at >= CURRENT_DATE - INTERVAL '7 days'"
        break
      case 'month':
        dateFilter = "AND sent_at >= CURRENT_DATE - INTERVAL '30 days'"
        break
      default:
        dateFilter = ''
    }

    // 获取总体统计
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent,
        COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
      FROM email_marketing_logs
      WHERE 1=1 ${dateFilter}
    `)

    // 获取各类型统计
    const typeStatsResult = await pool.query(`
      SELECT 
        email_type,
        COUNT(*) as count
      FROM email_marketing_logs
      WHERE 1=1 ${dateFilter}
      GROUP BY email_type
    `)

    const stats = statsResult.rows[0]
    const byType: Record<string, number> = {
      credit_low: 0,
      credit_empty: 0,
      first_purchase_offer: 0,
      last_chance_offer: 0
    }

    typeStatsResult.rows.forEach(row => {
      byType[row.email_type] = parseInt(row.count)
    })

    return NextResponse.json({
      total: parseInt(stats.total),
      sent: parseInt(stats.sent),
      failed: parseInt(stats.failed),
      byType
    })

  } catch (error) {
    console.error('获取营销邮件统计失败:', error)
    return NextResponse.json(
      { error: '获取统计失败' },
      { status: 500 }
    )
  }
}
