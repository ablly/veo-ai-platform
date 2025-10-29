import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

/**
 * 查询兑换码列表 - 管理员API（生产环境）
 * GET /api/admin/redemption-codes/list
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: 添加管理员权限验证
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'ALL'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = `
      SELECT 
        rc.*,
        u.email as redeemed_user_email,
        COUNT(*) OVER() as total_count
      FROM redemption_codes rc
      LEFT JOIN users u ON rc.redeemed_by = u.id
    `

    const params: any[] = []
    
    if (status !== 'ALL') {
      query += ` WHERE rc.status = $${params.length + 1}`
      params.push(status)
    }

    query += ` ORDER BY rc.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    const result = await pool.query(query, params)

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      codes: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit
      }
    })

  } catch (error) {
    console.error('查询兑换码列表失败:', error)
    return NextResponse.json({
      success: false,
      message: '查询失败'
    }, { status: 500 })
  }
}










