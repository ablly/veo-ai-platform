import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { createErrorResponse, Errors } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import { adminApiGuard } from "@/lib/admin-auth"

/**
 * 更新用户信息（管理员）
 * PUT /api/admin/users/[id]/update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 严格的管理员权限验证
  const authError = await adminApiGuard(request)
  if (authError) return authError

  try {
    const resolvedParams = await params
    const userId = resolvedParams.id
    const body = await request.json()
    
           const {
             credits,
             action // 'add' | 'set'
           } = body

    const client = await pool.connect()
    
    try {
      await client.query('BEGIN')

      // 根据不同操作执行不同逻辑
      if (credits !== undefined) {
        if (action === 'add') {
          // 增加积分
          await client.query(
            `INSERT INTO user_credit_accounts (
              user_id, available_credits, total_credits, used_credits, frozen_credits
            ) VALUES ($1, $2, $2, 0, 0)
            ON CONFLICT (user_id) DO UPDATE SET
              available_credits = user_credit_accounts.available_credits + $2,
              total_credits = user_credit_accounts.total_credits + $2,
              updated_at = NOW()`,
            [userId, credits]
          )
          
          logger.info('管理员增加用户积分', {
            adminEmail: "3533912007@qq.com",
            userId,
            credits
          })
        } else if (action === 'set') {
          // 设置积分
          await client.query(
            `INSERT INTO user_credit_accounts (
              user_id, available_credits, total_credits, used_credits, frozen_credits
            ) VALUES ($1, $2, $2, 0, 0)
            ON CONFLICT (user_id) DO UPDATE SET
              available_credits = $2,
              updated_at = NOW()`,
            [userId, credits]
          )
          
          logger.info('管理员设置用户积分', {
            adminEmail: "3533912007@qq.com",
            userId,
            credits
          })
        }
      }


      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: '用户信息更新成功'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error) {
    const resolvedParams = await params
    const userId = resolvedParams.id
    logger.error('更新用户信息失败', {
      error: error instanceof Error ? error : new Error(String(error)),
      userId: userId
    })
    return createErrorResponse(Errors.INTERNAL_SERVER_ERROR, "更新用户信息失败")
  }
}


