import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { adminApiGuard } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  // 管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') || 'all'
    const range = searchParams.get('range') || 'week'
    const offset = (page - 1) * limit

    // 构建查询条件
    let typeFilter = ''
    if (type !== 'all') {
      typeFilter = `AND eml.email_type = '${type}'`
    }

    let dateFilter = ''
    switch (range) {
      case 'today':
        dateFilter = "AND eml.sent_at >= CURRENT_DATE"
        break
      case 'week':
        dateFilter = "AND eml.sent_at >= CURRENT_DATE - INTERVAL '7 days'"
        break
      case 'month':
        dateFilter = "AND eml.sent_at >= CURRENT_DATE - INTERVAL '30 days'"
        break
      default:
        dateFilter = ''
    }

    // 获取日志列表
    const logsResult = await pool.query(`
      SELECT 
        eml.id,
        eml.email_type,
        eml.status,
        eml.sent_at,
        eml.message_id,
        u.email as user_email,
        u.name as user_name
      FROM email_marketing_logs eml
      JOIN users u ON u.id = eml.user_id
      WHERE 1=1 ${typeFilter} ${dateFilter}
      ORDER BY eml.sent_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset])

    // 获取总数
    const countResult = await pool.query(`
      SELECT COUNT(*) as total
      FROM email_marketing_logs eml
      WHERE 1=1 ${typeFilter} ${dateFilter}
    `)

    const total = parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      logs: logsResult.rows,
      page,
      totalPages,
      total
    })

  } catch (error) {
    console.error('获取营销邮件日志失败:', error)
    return NextResponse.json(
      { error: '获取日志失败' },
      { status: 500 }
    )
  }
}
