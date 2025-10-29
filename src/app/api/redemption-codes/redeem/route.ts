import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

/**
 * 兑换积分码 - 用户API（生产环境）
 * POST /api/redemption-codes/redeem
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: '请先登录' 
      }, { status: 401 })
    }

    const body = await req.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: '请输入兑换码' 
      }, { status: 400 })
    }

    // 标准化兑换码格式（转大写，去除空格）
    const normalizedCode = code.trim().toUpperCase()

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 查询用户ID
      const userResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [session.user.email]
      )

      if (userResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '用户不存在' 
        }, { status: 404 })
      }

      const userId = userResult.rows[0].id

      // 查询兑换码
      const codeResult = await client.query(
        `SELECT * FROM redemption_codes WHERE code = $1 FOR UPDATE`,
        [normalizedCode]
      )

      if (codeResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '兑换码不存在' 
        }, { status: 404 })
      }

      const redemptionCode = codeResult.rows[0]

      // 验证兑换码状态
      if (redemptionCode.status !== 'ACTIVE') {
        await client.query('ROLLBACK')
        const statusMessage = {
          'REDEEMED': '此兑换码已被使用',
          'EXPIRED': '此兑换码已过期',
          'VOIDED': '此兑换码已作废'
        }[redemptionCode.status] || '兑换码无效'
        
        return NextResponse.json({ 
          success: false, 
          message: statusMessage 
        }, { status: 400 })
      }

      // 检查是否过期
      if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
        // 更新状态为已过期
        await client.query(
          `UPDATE redemption_codes SET status = 'EXPIRED', updated_at = NOW() WHERE id = $1`,
          [redemptionCode.id]
        )
        await client.query('ROLLBACK')
        
        return NextResponse.json({ 
          success: false, 
          message: '此兑换码已过期' 
        }, { status: 400 })
      }

      // 检查用户是否已兑换过此码（防止重复兑换）
      const historyCheck = await client.query(
        'SELECT id FROM redemption_history WHERE redemption_code_id = $1 AND user_id = $2',
        [redemptionCode.id, userId]
      )

      if (historyCheck.rows.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: '您已经兑换过此兑换码' 
        }, { status: 400 })
      }

      // 给用户充值积分
      await client.query(
        `INSERT INTO user_credit_accounts (user_id, available_credits, total_credits, used_credits, frozen_credits, created_at, updated_at)
         VALUES ($1, $2, $2, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           available_credits = user_credit_accounts.available_credits + $2,
           total_credits = user_credit_accounts.total_credits + $2,
           updated_at = NOW()`,
        [userId, redemptionCode.credits]
      )

      // 记录积分变动
      const balanceResult = await client.query(
        'SELECT available_credits FROM user_credit_accounts WHERE user_id = $1',
        [userId]
      )
      const newBalance = balanceResult.rows[0].available_credits

      await client.query(
        `INSERT INTO credit_transactions (
          user_id, type, amount, description, 
          balance_before, balance_after, created_at
        ) VALUES ($1, 'REDEMPTION', $2, $3, $4, $5, NOW())`,
        [
          userId,
          redemptionCode.credits,
          `兑换码充值: ${normalizedCode}`,
          newBalance - redemptionCode.credits,
          newBalance
        ]
      )

      // 更新兑换码状态
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
      const userAgent = req.headers.get('user-agent') || 'unknown'

      await client.query(
        `UPDATE redemption_codes 
         SET status = 'REDEEMED', 
             redeemed_by = $1, 
             redeemed_at = NOW(),
             updated_at = NOW()
         WHERE id = $2`,
        [userId, redemptionCode.id]
      )

      // 记录兑换历史
      await client.query(
        `INSERT INTO redemption_history (
          redemption_code_id, user_id, credits, ip_address, user_agent, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())`,
        [redemptionCode.id, userId, redemptionCode.credits, ipAddress, userAgent]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        credits: redemptionCode.credits,
        newBalance,
        message: `成功兑换 ${redemptionCode.credits} 积分！`
      })

    } catch (error) {
      await client.query('ROLLBACK')
      console.error('兑换失败:', error)
      return NextResponse.json({
        success: false,
        message: '兑换失败，请稍后重试'
      }, { status: 500 })
    } finally {
      client.release()
    }

  } catch (error) {
    console.error('兑换API错误:', error)
    return NextResponse.json({
      success: false,
      message: '服务器错误'
    }, { status: 500 })
  }
}



