import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 获取邮件发送历史
 * GET /api/admin/notifications/email-history
 */
export async function GET(request: NextRequest) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || 'all' // all | SUCCESS | FAILED
    const offset = (page - 1) * limit

    // 构建查询条件
    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []
    let paramIndex = 1

    if (status !== 'all') {
      whereClause += ` AND status = $${paramIndex}`
      queryParams.push(status)
      paramIndex++
    }

    // 查询邮件历史
    const historyQuery = `
      SELECT 
        id,
        recipient_email,
        subject,
        content,
        status,
        error_message,
        sent_at
      FROM email_send_history
      ${whereClause}
      ORDER BY sent_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    queryParams.push(limit, offset)
    const historyResult = await pool.query(historyQuery, queryParams)

    // 查询总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM email_send_history
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, queryParams.slice(0, -2))
    const totalRecords = parseInt(countResult.rows[0].total)
    const totalPages = Math.ceil(totalRecords / limit)

    logger.info("管理员查询邮件历史", {
      context: {
        page,
        limit,
        status,
        total_records: totalRecords
      }
    })

    return NextResponse.json({
      success: true,
      history: historyResult.rows,
      totalRecords,
      totalPages,
      currentPage: page
    })

  } catch (error) {
    logger.error("查询邮件历史失败", { 
      error: error instanceof Error ? error : new Error(String(error))
    })
    return createErrorResponse(Errors.internalError(), "查询邮件历史失败")
  }
}
