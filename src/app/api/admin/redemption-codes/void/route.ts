import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

/**
 * 作废兑换码 - 管理员API（生产环境）
 * POST /api/admin/redemption-codes/void
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const { codeId } = body

    if (!codeId) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少兑换码ID' 
      }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE redemption_codes 
       SET status = 'VOIDED', updated_at = NOW()
       WHERE id = $1 AND status = 'ACTIVE'
       RETURNING code`,
      [codeId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '兑换码不存在或已被使用' 
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `兑换码 ${result.rows[0].code} 已作废`
    })

  } catch (error) {
    console.error('作废兑换码失败:', error)
    return NextResponse.json({
      success: false,
      message: '操作失败'
    }, { status: 500 })
  }
}









