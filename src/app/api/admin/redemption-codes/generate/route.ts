import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'
import crypto from 'crypto'

/**
 * 生成积分兑换码 - 管理员API（生产环境）
 * POST /api/admin/redemption-codes/generate
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // TODO: 添加管理员权限验证
    // 临时使用登录验证，生产环境需要添加角色检查
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: '未授权' }, { status: 401 })
    }

    const body = await req.json()
    const {
      count = 1,
      credits,
      packageId,
      packageName,
      price,
      expiryDays,
      notes
    } = body

    // 验证参数
    if (!credits || credits <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: '积分数必须大于0' 
      }, { status: 400 })
    }

    if (count <= 0 || count > 1000) {
      return NextResponse.json({ 
        success: false, 
        message: '生成数量必须在1-1000之间' 
      }, { status: 400 })
    }

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      const codes = []
      const expiresAt = expiryDays 
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) 
        : null

      for (let i = 0; i < count; i++) {
        // 生成唯一兑换码：VEO-XXXX-XXXX
        const code = generateRedemptionCode()
        
        const result = await client.query(
          `INSERT INTO redemption_codes 
           (code, credits, package_id, package_name, price, status, created_by, expires_at, notes, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, $7, $8, NOW(), NOW())
           RETURNING id, code, credits, expires_at`,
          [code, credits, packageId, packageName, price, session.user.email, expiresAt, notes]
        )

        codes.push(result.rows[0])
      }

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        codes,
        count: codes.length,
        message: `成功生成 ${codes.length} 个兑换码`
      })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('生成兑换码失败:', error)
      return NextResponse.json({
        success: false,
        message: '生成兑换码失败'
      }, { status: 500 })
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('生成兑换码API错误:', error)
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}

/**
 * 生成唯一兑换码
 * 格式：VEO-XXXX-XXXX（大写字母+数字，去除易混淆字符）
 */
function generateRedemptionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 去除 0,O,1,I 等易混淆字符
  const segments = 2
  const segmentLength = 4
  
  const code = []
  for (let i = 0; i < segments; i++) {
    let segment = ''
    const randomBytes = crypto.randomBytes(segmentLength)
    
    for (let j = 0; j < segmentLength; j++) {
      segment += chars[randomBytes[j] % chars.length]
    }
    code.push(segment)
  }
  
  return `VEO-${code.join('-')}`
}










